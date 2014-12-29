require 'thor'
require 'mechanize'
require 'nokogiri'
require 'json'
require 'base64'
require 'open-uri'
require 'fileutils'
require 'uri'
require 'net/http'
require 'thread/pool'
require 'riots/riots_catalog'

module Riots

	class Sparkfun
		include Riots::RiotsCatalog

		BASE_URL = "https://www.sparkfun.com"
		CATEGORIES_URL = "#{BASE_URL}/categories"
		EXCLUDE_CATEGORIES = [ "books", "serial", "swag", "educators", "retired", "lcds", "color", "monochrome" ]

		def initialize(options = {})
			@agent = Mechanize.new
			@agent.user_agent = 'Chrome/30.0.1599.101'
			@category_seen = []
			@product_seen = []
			@options = options
			@pool = Thread.pool(30)
			@output_dir = !options.include?("es_host") ? options["output_dir"] : "."
			unless File.exists?(@output_dir)
				FileUtils::mkdir_p @output_dir
			end
			@product_count = 0
		end

		def fetch()
			puts "Running SparkFun extractor..."
			page = @agent.get(CATEGORIES_URL)

			page.links.uniq.each do |link|
				if link.href =~ /\/categories\// and not @category_seen.include? link.href  and not link.href =~ /retired/
					@category_seen << link.href
					extract_categories(link)
				end
			end

			@pool.shutdown if @pool != nil
			puts "Stats: #{@product_count} products extracted"
		end

		private 

		def extract_categories(link)
			category = link.text
			# TODO change this for testing only the GPS category 
			unless  EXCLUDE_CATEGORIES.include? category.downcase
			#if "gps" == category.downcase # for testing
				url = link.href
				unless url =~ /^#{BASE_URL}/
					url = "#{BASE_URL}#{url}"
				end
				puts "Processing category: #{category} - link: #{url}"
				extract_products(category, @agent.get(url))
			end
		end

		def extract_products(category, page)
			page.links.uniq.each do |link|
				if link.href =~ /\/products\// and not @product_seen.include? link.href
					@product_seen << link.href
					#extract_product(category, link) 
					@pool.process { extract_product(category, link) }
				end
			end
		end		

		def extract_product(category, link)
			puts "  -- #{link.href}"
			page = @agent.get(link.href)

			# the product id in that is part of the URL
			file_id = link.href[link.href.index(/products\//) + 9, link.href.size]
			filename =  "#{file_id}.json"
			#puts "  -- filename: #{filename}"			

			product = {}
			product["name"] = page.search("//h1[@itemprop='name']").text
			product["manufacturer-id"] = page.search("//*[@id='airlock']/div[2]/div/meta[1]/@content")			
			product['tags'] = [ category ]
			product['creation-date'] = DateTime.now
			product['creator-id'] = 'dev@riox.io'
			product["features"] = {} 
			product["features"]["origin_url"] = link.href
			product["features"]["mpn"] = page.search("//*[@id='airlock']/div[2]/div/meta[2]/@content")		
			product["features"]["sku"] = page.search("//*[@id='airlock']/div[2]/div/meta[3]/@content")			

			# extract images as base64
			product['image-urls'] = []		
			nodeset = page.search("//*[@id='images-carousel']/div[1]")			

			# create dir for images
			FileUtils::mkdir_p "#{@output_dir}/img/sparkfun"
				
			nodeset.children.each_with_index do |n, i|
				image_url = n.children[1]['src']			 	
				img_filename = "img/sparkfun/#{file_id}-image-#{i}#{File.extname(image_url)}"

				unless @options[:no_image_download]
					open(image_url, "rb") do |f|
	   					File.open("#{@output_dir}/#{img_filename}","wb") do |file|
	     					file.puts f.read
	   					end
					end
				end
				product['image-urls'] << img_filename
			end


			# extract core text parts
			node = page.search("//*[@id='airlock']/div[2]/div/div[1]/div[4]/div[2]").children

			product['description'] = extract_section(node.text.strip, product, "Description")

			# extract features
			features = extract_section(node.text.strip, product, "Features")
			unless features.nil?
				product['features']['main'] = features.strip #.split(/\n+/)
			end

			#extract dimensions
			dimensions = extract_section(node.text.strip, product, "Dimensions")
			unless dimensions.nil?
				product['features']['dimensions'] = dimensions
			end

			# extract includes
			includes = extract_section(node.text.strip, product, "Includes")
			unless includes.nil?
				product['features']['includes'] = includes.strip #.split(/\n+/)
			end

			extract_documents(node, product)

			# write document to riots catalog
			if @options[:catalog_host]
				post_to_riots_catalog(@options[:catalog_host], file_id, JSON.pretty_generate(product))
			else 
				File.open(File.join(@output_dir, filename), 'w') do |file| 
					file.write(JSON.pretty_generate(product)) 
				end
			end

			@product_count = @product_count + 1
		end

		def extract_documents(node, product)
			matching_text = extract_section(node.inner_html, product, "Dimensions")
			
			# parse document section as fragment for easier traversal 
			links = Nokogiri::HTML(matching_text)
			links = links.xpath("//a")
			if links.size > 0
				product['properties']['additional_documents'] = [] 
				links.each do |l|					
					product['properties']['additional_documents'] << { "name" => l.text, "link" => l['href'] };
				end
			end
		end

		def extract_section(text, product, section)
			regex = /(<strong>)?(\s*)#{section}:\s*(<\/strong>)?/
			matching_text = regex.match(text)
			# TODO handle non-match
			return if matching_text.nil?
			matching_text =	matching_text.post_match

			# TODO fix ordering in here by not looking at an order
			stop_words = ["Includes", "Features", "Dimensions", "Documents", "Replaces", "Length" ]
			end_idx = nil
			i = 0
			while end_idx.nil? && i < stop_words.length
				end_idx = matching_text.index(/(<strong>)?\s*#{stop_words[i]}:\s*(<\/strong>)?/)
				i = i+1
			end
			if end_idx.nil?
				end_idx = matching_text.length
			end
			return matching_text[0, end_idx].strip
		end

	end
end