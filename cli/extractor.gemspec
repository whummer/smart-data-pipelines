# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'riots/version'

Gem::Specification.new do |spec|
  spec.name          = "extractor"
  spec.version       = Riots::VERSION
  spec.authors       = ["riox", "Waldemar Hummer"]
  spec.email         = ["riox@riots.io"]
  spec.summary       = %q{Extracts IoT device data from various sources}
  spec.description   = %q{Write a longer description. Optional.}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.7"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_runtime_dependency "thor", "~> 0.19.1" 
  spec.add_runtime_dependency "mechanize", "~> 2.7.3" 
  spec.add_runtime_dependency "nokogiri", "~> 1.6.5"  
  spec.add_runtime_dependency "thread", "~> 0.1.4"
  spec.add_runtime_dependency "httpclient", "~> 2.5.3"
  spec.add_runtime_dependency "oauth2", "~> 1.0.0"
  spec.add_runtime_dependency "phantomjs", "~> 1.9.7.1"

end
