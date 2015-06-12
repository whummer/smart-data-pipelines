var http = require('http'),
		https = require('https'),
    httpProxy = require('./http-proxy'),
    fs = require('fs'),
    connect = require('connect'),
    morgan = require('morgan'),
    request = require('request')
		ratelimiter = require('connect-ratelimit');    

// 1. Create the proxy server instance
var proxyServer = httpProxy.createProxyServer(
	{ 
		target: {
			host: 'localhost',
			port: 9014
		},
  	xfwd: true
	}
);

// 2. Create connect app, include middleware and proxy web calls. 
var app = connect()
  .use(morgan('combined'))
	.use(function(req, res) {
			console.log("before proxy request");
    	proxyServer.web(req, res);
});

// 3. Create the http server and add the app
var server = https.createServer(
	{
		key: fs.readFileSync('./ssl.key', 'utf8'),
	  cert: fs.readFileSync('./ssl.crt', 'utf8')	  
	},
	app);


server.on("data", function(data) {
		console.log("on data: ", data );

	}); 


// 4. Listen to the `upgrade` event and proxy the WebSocket requests as well.
server.on('upgrade', function (req, socket, head) {	
	// console.log(head);

	proxyServer.ws(req, socket, head);

});

proxyServer.on('proxyRes', function (proxyRes, req, res) {
  console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
});

//
// Listen for the `open` event on `proxy`.
//
proxyServer.on('open', function (proxySocket) {
  // listen for messages coming FROM the target here
});


server.listen(8000, function() {
	console.log('Proxy listing on port 8000');
});