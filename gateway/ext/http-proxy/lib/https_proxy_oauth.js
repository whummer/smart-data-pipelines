var http = require('http'),
		https = require('https'),
    httpProxy = require('http-proxy'),
    fs = require('fs'),
    connect = require('connect'),
    morgan = require('morgan'),
    request = require('request'),
    OAuth2 = require("connect-oauth2"),
    querystring = require('querystring'),
    Auth = require('./auth');

var token = null,
	options = {
		api: "http://localhost:8000",
		app: {
			client_id : 'test123',
			client_secret : 'mypassword'
		}
	};
// helper
var my = new Auth( options );


function authority( data, callback ){
	console.log( "authorize data", data );
	for(var key in data){
		// key can be: client_id, client_secret, username, password
		// validate data here...
	}
	return callback(true);
}


var app = connect()
  .use(morgan('combined'))  
  .use(
  	OAuth2({
    	authority: authority,
    	store: "memory"
    }))  
	.use(function(req, res){
		// simple router
		var path = req._parsedUrl.pathname;

		switch( path ){
			// CLIENT
			case "/calendar":
				// check login state
				if( token ){
					res.end("You are now logged in! Token: "+ token);
				} else {
					// display login button
					res.end( my.login() );
				}
			break;
			case "/auth/code":
				var params = querystring.parse( req._parsedUrl.query );
				console.log( "params", params );
				// stop if we have an error
				if( params.error) return res.end( params.error );
				// exchange the code for and access code
				var url = my.token( params.code );
				res.writeHead(307, {'Location': url });
				res.end();
			break;
			case "/auth/token":
				var params = querystring.parse( req._parsedUrl.query );
				console.log( "params", params );
				// save token and redirect back to the homepage
				token = params.access_token;
				var url = "/";
				res.writeHead(307, {'Location': url });
				res.end();
			break;
			// REMOTE
			case "/oauth/authorize":
				// present the dialog
				console.log("check session...");
				// use template engine for this...
				var form = my.dialog( req );

				res.end( form );
			break;

			default: 
				// pass through and let the application deal with this
    		proxy.web(req, res);

		}
	});



proxy = httpProxy.createProxyServer({
	target: { 
		host: 'localhost',
		port: 3000
	},
	xfwd: true
});

//https.createServer(
http.createServer(
	// {
	// 	key: fs.readFileSync('./ssl.key', 'utf8'),
	//   cert: fs.readFileSync('./ssl.crt', 'utf8')	  
	// },
	app).listen(8000, function(){
  console.log('Proxy listening on port 8000');
});


//
// Create your target server
//
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000);