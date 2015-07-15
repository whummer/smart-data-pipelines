module Riots::RiotsCatalog

	def post_to_riots_catalog(catalog_host, id, product_json) 
		uri = URI(catalog_host)
		req = Net::HTTP::Post.new("/api/v1/catalog/thing-types", initheader = { 'Content-Type' => 'application/json'})
		req.body = product_json
		response = Net::HTTP.new(uri.host, uri.port).start {|http| http.request(req) }
		if response.code == '200' or response.code == '201'
			puts "Successfully posted product id '#{id}' to Riots Catalog"
		elsif response.code == '409' 
			puts "Product id '#{id}' already exists in Riots Catalog"
		else
			puts "Error '#{response.code}': Failed to post product id '#{id}' to Riots Catalog"
		end
	end
end