var http = require('http'),
		https = require('https'),
		logger = require('./logging'),
    httpProxy = require('./http-proxy'),
    fs = require('fs');


logger.level = 'debug';

var proxy = httpProxy.createProxyServer({
	target: { 
		host: 'localhost',
		port: 3000
	},
	xfwd: true,
	ssl: {
		key: fs.readFileSync('./ssl.key', 'utf8'),
	  cert: fs.readFileSync('./ssl.crt', 'utf8')	  
	}
	// ignorePath: true
}).listen(8000);

// proxy.listen(8000), function(){
//   console.log('Proxy listening on port 8000');
// });

// var app = connect();


// app.use(morgan('combined'))

// THIS CONFIGURES RATE LIMITS
// app.use(ratelimiter({
// 	  whitelist: [ "127.0.0.1", "localhost" ],
// 	  blacklist: [ ],
// 	  categories: {
// 	    whitelist: {
//     		totalRequests: -1,
//     		every:         60 * 60 * 1000
// 		  },
// 		 	blacklist: {
// 		   	 totalRequests: 0,
// 		   	 every:         60 * 60 * 1000 
// 		  },
// 		  normal: {
// 		    totalRequests: 500,
// 		    every:         60 * 60 * 1000
// 		  }
// 	  }
// 	}));

// var config = { "target" : "http://localhost:3000/"};

// // setup routes
// app.use(connectRoute(function (router) {
//     // router.get('/*', function (req, res, next) {
//     // 	proxy.web(req, res);
//     // });
 
//     router.get('/users', function (req, res, next) {
//     	// console.log("HERE");
//     	proxy.web(req, res, config );
//     });

 
//     // router.get('/home/:id', function (req, res, next) {
//     //   proxy.web(req, res);

//     // });
 
//     // router.post('/home', function (req, res, next) {
//     //   proxy.web(req, res);
//     // });
// }));


// Proxy the actual request
	// app.use(function(req, res) {
	// 	if (res.ratelimit.exceeded) {
 //    	res.end(res.ratelimit.client.name + ' exceeded the rate limit!');
 //    } else {
 //    	proxy.web(req, res);
 //    }
	// });

// // DEPENDING WHETHER WE NEED SSL THIS NEEDS TO BE CHANGED
// var server = https.createServer(
// // var server = http.createServer(
// 	{
// 		key: fs.readFileSync('./ssl.key', 'utf8'),
// 	  cert: fs.readFileSync('./ssl.crt', 'utf8')	  
// 	},
// 	function (req, res) {


//  		// if (req.url === '/users') {
//  			proxy.web(req, res, config );
//     // }

//   });


// server.listen(8000, function(){
//   console.log('Proxy listening on port 8000');
// });
