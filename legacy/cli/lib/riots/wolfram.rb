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
require 'httpclient'
require 'extractor/elasticsearch'

module Riots
	
	class Wolfram
		include Riots::Elasticsearch
	
		BASE_URL = "http://devices.wolfram.com"

		def initialize(options = {})		
			@agent = Mechanize.new
			@options = options
			@httpclient = HTTPClient.new(nil, 'Chrome/30.0.1599.101', nil)
			@limit = options[:limit] || 50
			@output_dir = !options.include?("es_host") ? options["output_dir"] : "."
			unless File.exists?(@output_dir)
				FileUtils::mkdir_p @output_dir
			end
			@product_count = 0
		end

		def fetch()
			puts "Running Wolfram extractor..."
			response = @httpclient.get "http://devices.wolfram.com/search-api/search.json?disableAds=true&query=*&limit=#{@limit}&disableSpelling=true&collection=connected_devices&fields=Name&felds=StandardName&fields=NarrativeDescription&fields=PhysicalQuantityDisplayName&fields=Manufacturer&fields=CDPLink&fields=title&fields=summary&fields=url&fields=label&fields=FormFactor&fields=PowerSource&fields=CommunicationProtocol"
			body = JSON.parse(response.body)

			devices = body["results"]["connected_devices"]
			devices.each do |d|
				fields = d["fields"]

				product = {}
				product["name"] = fields["Name"][0]
				product["manufacturer"] = fields["Manufacturer"][0]	
			    #product["mpn"] = ""
				#product["sku"] = ""
				if fields["NarrativeDescription"]
					product['description'] = fields["NarrativeDescription"][0]
				end
				product['tags'] = []
				if fields["PhysicalQuantityDisplayName"]
			    	product['tags'] = fields["PhysicalQuantityDisplayName"]
			    end

			    product["properties"] = {} 
			    product["properties"]["origin_url"] = File.join(BASE_URL, 'devices', fields['CDPLink'])
			    
			    if fields["CommunicationProtocol"]
			    	product["properties"]["communication_protocols"] = fields["CommunicationProtocol"]
			    end
				if fields["FormFactor"]
					product["properties"]["form_factor"] = fields["FormFactor"][0]
				end
				if fields["PowerSource"] 
					product["properties"]["power_source"] = fields["PowerSource"][0]					
				end

				file_id = d["doc"].to_i
				filename = "#{file_id}.json"
				puts "filename: #{filename}"
				#puts JSON.pretty_generate(product)

				extract_details_from_html(product["properties"]["origin_url"], product)

				# write document to Elasticsearch or file
				if @options[:es_host]
					post_to_elasticsearch(@options[:es_host], file_id, JSON.pretty_generate(product))
				else 
					File.open(File.join(@output_dir, filename), 'w') do |file| 
						file.write(JSON.pretty_generate(product)) 
					end
				end

				@product_count = @product_count + 1
			end

			puts "Stats: #{@product_count} products extracted"
		end

		private 

		def extract_details_from_html(link, product)	
			puts "  -- #{link}"
			if @limit > 30	
				sleep 15
			end
			page = @agent.get(link)

			extract_sensors(page.search("//*[@id='wrapper1']/div[2]/section/table"), product)
			extract_specification(page.search("//*[@id='features']/table"), product)
			extract_image(page, product)
		end

		def extract_image(page, product)
 			link = page.search("//*[@id='wrapper1']/div[1]/section/div[1]/div")
 			product["properties"]["product_url"] = link.search("a").attribute("href")

 			# extract images as base64
			product['images'] = []		
			image_url = File.join(BASE_URL, link.search("img").attribute("src"))
			image_extension = File.extname(image_url)[1..-1]
			
			image = {}
			image['content-type'] = "image/#{image_extension}"
			image['content'] = Base64.encode64(open(image_url, "rb").read)
			image['source'] = image_url
			product['images'] << image			
		end
			
		def extract_sensors(node, product)
			sensor_name = node.children.search("td")[0]
			if sensor_name
				sensor_name = sensor_name.text.strip

				measures = node.children.search("td")[1]
				if measures
					measures = measures.text.strip
				end		
				units = node.children.search("td")[2]
				if units 
					units = units.text.strip
				end
				range = node.children.search("td")[3]
				if range
					range = range.text.strip
				end			
				if range != nil && range != ""
					matches = /(^\d+.?\d*)\D*(\d+[\.|,]?\d*)/.match(range)
					lower_bound = matches[1]
					upper_bound = matches[2]
					#puts " -- lower_bound: #{lower_bound}"						
					#puts " -- upper_bound: #{upper_bound}"					
				end			

				property = {} 
				product["deviceProperties"] = [ property ]

				property['baseType'] = "DOUBLE"
				property["name"] = sensor_name
				property["tag"] = [ measures ]
				property["metadata"] = { "sensable" => true, "actuatable" => false }
				property["valueDomain"] = { "type" => "Continuous", "min" => lower_bound, "max" => upper_bound }
				property["semanticType"] = measures
				property['unit'] = units
			end			
		end

		# extract all information that we could not get from the JSON request in the first place
		def extract_specification(node, product)
			ignore_list = ["Specifications", "Communication Protocol", "Power Source", "Form Factor"]

			node.children.search("tr").each do |tr|
				#puts tr.inspect
				tds = tr.search("td")
				if tds.size == 2
					label = tds[0].text.strip
					value = tds[1].text.strip
					unless ignore_list.include? label

						# TODO handle value that is a string
						if value
				 			product["properties"][convert_label(label)]	= value
				 		end
					end
				end			
			end
		end

		# Convert "Something Good" to "something_good"
		def convert_label(str)
			str.downcase.gsub(' ', '_')
		end

	end
end