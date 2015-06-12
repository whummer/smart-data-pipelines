var http = require('http'),
		https = require('https'),
    httpProxy = require('http-proxy'),
    fs = require('fs'),
    connect = require('connect'),
    morgan = require('morgan'),
    request = require('request')
		ratelimiter = require('connect-ratelimit')
		connectRoute = require('connect-route');


var proxy = httpProxy.createProxyServer({
	// target: { 
	// 	host: 'localhost',
	// 	port: 9000
	// },
	xfwd: true
});


var app = connect();


app.use(morgan('combined'))

// THIS CONFIGURES RATE LIMITS
app.use(ratelimiter({
	  whitelist: [ "127.0.0.1", "localhost" ],
	  blacklist: [ ],
	  categories: {
	    whitelist: {
    		totalRequests: -1,
    		every:         60 * 60 * 1000
		  },
		 	blacklist: {
		   	 totalRequests: 0,
		   	 every:         60 * 60 * 1000 
		  },
		  normal: {
		    totalRequests: 500,
		    every:         60 * 60 * 1000
		  }
	  }
	}));

// setup routes
app.use(connectRoute(function (router) {
    // router.get('/*', function (req, res, next) {
    // 	proxy.web(req, res);
    // });
 
    router.get('/login', function (req, res, next) {
      proxy.web(req, res, { "target" : "http://localhost:9000"} );
    });

    router.get('/login2', function (req, res, next) {
      proxy.web(req, res, { "target" : "http://localhost:9001"} );
    });
 
 
    // router.get('/home/:id', function (req, res, next) {
    //   proxy.web(req, res);

    // });
 
    // router.post('/home', function (req, res, next) {
    //   proxy.web(req, res);
    // });
}));


// Proxy the actual request
	// app.use(function(req, res) {
	// 	if (res.ratelimit.exceeded) {
 //    	res.end(res.ratelimit.client.name + ' exceeded the rate limit!');
 //    } else {
 //    	proxy.web(req, res);
 //    }
	// });

// DEPENDING WHETHER WE NEED SSL THIS NEEDS TO BE CHANGED
var server = https.createServer(
// http.createServer(
	{
		key: fs.readFileSync('./ssl.key', 'utf8'),
	  cert: fs.readFileSync('./ssl.crt', 'utf8')	  
	},
	app);

server.listen(8000, function(){
  console.log('Proxy listening on port 8000');
});


//
// Create your target server
//
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  console.log(req.url);
  if (req.url == "/login") {
  	console.log("SAU");
  	res.write('/login successfully proxied to 9000!');
  } else {
	  res.write('request successfully proxied to 9000!' + '\n' + JSON.stringify(req.headers, true, 2));
  }

  res.end();
}).listen(9000);

http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  console.log(req.url);
  if (req.url == "/login") {
  	console.log("SAU");
  	res.write('/login successfully proxied to 9001!');
  } else {
  	res.write('request successfully proxied to 9001' + '\n' + JSON.stringify(req.headers, true, 2));
  }
  res.end();
}).listen(9001);