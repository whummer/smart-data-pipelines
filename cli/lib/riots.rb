require "riots/string"
require "riots/version"
require "riots/auth"
require "thor"
require 'io/console'

module Riots

	class CLI < Thor

		class_option :output_dir, :type => :string, :default => ".", :required => false, :aliases => "-o"

		default_task :help

    desc "login", "Authenticate with username and password"
    def login(spec)
      networks = ["github", "google", "facebook"]
      if !spec.match(/^.*@.*$/)
        puts "Illegal authentication string. Please use <user>@<network>"
        return
      end
      username = spec.split("@")[0]
      network = spec.split("@")[1]
      if !networks.include? network
        puts "Illegal authentication network. Choose one of: #{networks}"
        return
      end
      print "Enter password: "
      password = pass = STDIN.noecho(&:gets).chomp
      puts
      Riots::Auth.login(network, username, password)
    end

    desc "fetch", "Fetches data from a given provider"
    method_option :catalog_host, :type => :string, :required => false, :aliases => "-h",
                  :banner => "Riots catalog host to post data into. If not set, we output to files"
    method_option :limit, :type => :numeric, :required => false, :aliases => "-l"
    method_option :no_image_download, :type => :boolean, :required => false, :default => false
    def fetch(provider)
      begin
        require "riots/#{provider}"
        extractor = Object.const_get "Riots" # load module
        clazz = extractor.const_get provider.camel_case # load class relative to module
        clazz.new(options).fetch
      rescue LoadError => e
        puts e
        warn "Unknown provider: #{provider}"
        exit -1
      end
    end

		no_commands do
			def to_camel_case(str)
				str.split('-').map.with_index{|x,i| i > 0 ? x.capitalize : x}.join
			end
		end
	end
end
