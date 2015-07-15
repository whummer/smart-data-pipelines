module Riots::Elasticsearch

	def post_to_elasticsearch(es_host, id, product_json) 
		uri = URI(es_host)
		req = Net::HTTP::Put.new("/products/sparkfun/#{id}", initheader = { 'Content-Type' => 'application/json'})
		req.body = product_json
		response = Net::HTTP.new(uri.host, uri.port).start {|http| http.request(req) }
		if response.code == '200' or response.code == '201'
			puts "Successfully posted product id '#{id}' to ElasticSearch"
		elsif reponse.code == '409' 
			puts "Product id '#{id}' already exists in ElasticSearch"
		else
			puts "Error '#{response.code}': Failed to post product id '#{id}' to ElasticSearch"
		end
	end
end