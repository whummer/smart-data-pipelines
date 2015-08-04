# Extractor

Extracts IoT device information from various sources.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'extractor'
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install extractor

## Usage

When you develop and you want to avoid installing the gem, run the following command
```
$ rvm all do bundle exec ./bin/extractor fetch sparkfun [OPTIONS]
```

If you chose to install the gem, just run

```
extractor fetch sparkfun -o ./tmp
```

This will output one JSON file per product with the extracted data.  

If you want your data in ElasticSearch, run the following:
```
$docker run -d -p 9200:9200 -p 9300:9300 dockerfile/elasticsearch
$extractor fetch sparkfun -e http(s)://localhost:9200
```

After that check if you have data in the ElasticSearch index. 

```
$ curl "http://localhost:9200/products/sparkfun/_search?q=*:*&size=*&pretty=true"

```

Currently we only support [SparkFun](www.sparkfun.com),  we may add other sources as well.


## Contributing

1. Fork it ( https://github.com/[my-github-username]/extractor/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
