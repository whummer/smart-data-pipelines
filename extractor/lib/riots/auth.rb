#
# 
#

module Riots::Auth

  @@networks = {
      "github" => {
        "web_url" => "https://github.com/login?return_to=%2Flogin%2Foauth%2Fauthorize%3Fclient_id%3D<client_id>%26display%3Dpopup%26redirect_uri%3Dhttp%253A%252F%252Flocalhost%253A8080%252Fapp%252Fviews%252Flogin_result.html%26response_type%3Dcode%26scope%3Duser%253A%252Cuser%253Aemail%26state%3D%257B%2522client_id%2522%253A%2522<client_id>%2522%252C%2522network%2522%253A%2522github%2522%252C%2522display%2522%253A%2522popup%2522%252C%2522callback%2522%253A%2522_hellojs_48u236uu%2522%252C%2522state%2522%253A%2522%2522%252C%2522redirect_uri%2522%253A%2522http%253A%252F%252Flocalhost%253A8080%252Fapp%252Fviews%252Flogin_result.html%2522%252C%2522scope%2522%253A%2522user%253A%252Cemail%252Cbasic%2522%252C%2522oauth%2522%253A%257B%2522version%2522%253A2%252C%2522auth%2522%253A%2522https%253A%252F%252Fgithub.com%252Flogin%252Foauth%252Fauthorize%2522%252C%2522grant%2522%253A%2522https%253A%252F%252Fgithub.com%252Flogin%252Foauth%252Faccess_token%2522%252C%2522response_type%2522%253A%2522code%2522%257D%252C%2522oauth_proxy%2522%253A%2522https%253A%252F%252Fauth-server.herokuapp.com%252Fproxy%2522%257D",
        "oauth_url" => "",
        "client_id" => "49dfffa20fdaf8c5529d"
      },
      "google" => {
        #"oauth_url" => "https://accounts.google.com/o/oauth2/auth",
        "oauth_url" => "https://auth-server.herokuapp.com/proxy",
        "client_id" => "1034816257353-9on087jmdlgqsh3rce5gdu1f2oouvgo0.apps.googleusercontent.com"
      },
      "facebook" => {
        "oauth_url" => "",
        "client_id" => "543561462440557"
      },
      "redirect_uri" => "http://localhost:8080/app/views/login_result.html"
  }

  def self.login(network, username, password) 
    require 'oauth2'
    net = @@networks[network]

  url = net["oauth_url"]
    #url = "#{url}?response_type=token&redirect_uri=null&scope=basic"

    require 'watir-webdriver'
    require 'phantomjs'
    path = Phantomjs.path

    url = net["web_url"]
    url = url.gsub("<client_id>", net["client_id"])
    url = "http://www.google.com/"
    url = "https://github.com/login"
    url = "https://auth-server.herokuapp.com/proxy"
    puts "INFO: Using URL #{url}, client id #{net["client_id"]}"

    # TODO fix!
#    ENV["PATH"] = "#{ENV["PATH"]}:#{File.dirname(Phantomjs.path)}"
#    b = Watir::Browser.new :phantomjs
#    time = b.goto(url)
#
#    puts "#{time} #{b}"
#    puts "#{b.url}"
#    puts "#{b.html}"
#    return
#
#    require 'phantomjs'
#    Phantomjs.path
#
#    require "capybara-webkit"
#    Capybara.javascript_driver = :webkit
#
#    require "akephalos"
#    Capybara.javascript_driver = :akephalos
#
#    require "selenium-webdriver"
#    driver = Selenium::WebDriver.for :firefox
#    driver = Selenium::WebDriver.for :chrome, :switches => %w[--ignore-certificate-errors --disable-popup-blocking --disable-translate]
#    driver.navigate.to url
#    element = driver.find_element(:id, 'login_field')
#    puts "element: #{element}"

#    client = OAuth2::Client.new(username, password, :site => url)
#    client.auth_code.authorize_url redirect_uri: '', scope: 'balance+user'
#    token = client.auth_code.get_token 'authorization_code_value',
#              headers: {'Authorization' => %^Basic #{Base64.encode64 "#{username}:#{password}"}^ }

    client = OAuth2::Client.new(net["client_id"], nil, {:token_url => url})

    token = client.password.get_token(username, password)
    puts(token)
  end

end
