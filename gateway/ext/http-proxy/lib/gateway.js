'use strict'

var logger = require('winston'),
		colors = require('colors'),
		fs = require('fs'),
		http = require('http'),
		https = require('https'),
		Promise = require('promise'),
		util = require('util'),
		connect = require('connect'),
		connectVhost = require('vhost'),
		// ratelimiter = require('connect-ratelimit')
		connectRoute = require('connect-route');
/*
 * Implements the Gateway. 
 * @param options a hash of options.
 */
function Gateway(options) {
	this.options = options;
	createServer.call(this, options);
}

// 
// Public methods
//

Gateway.prototype.start = function() {	
	logger.debug("Gateway::start");

	var port = this.options.port || 80;

	this.server.listen(port, function(){
		console.log('Gateway listening on port %d'.green, port);
	});

};

Gateway.prototype.stop = function() {
	logger.debug("Gateway::stop");
};

Gateway.prototype.reload = function() {
	logger.debug("Gateway::reload");
};

// 
// Private methods
//

function createServer(options) {
	this.app = connect(); // create connect middleware 

	// logging module
	if (this.options.logging) {
		// this.app.use(require("connect-winston")(require('winston')));
	}

	// create http(s) server instance
	if (this.options.ssl) {		
		this.server = https.createServer({
			key: fs.readFileSync(this.options.ssl.key, 'utf8'),
			cert: fs.readFileSync(this.options.ssl.cert, 'utf8')	  
		},
		this.app);	
	} else {
		this.server = http.createServer(this.app);		
	}

	// create proxy instance
	this.proxy = require('./http-proxy').createProxyServer({
		xfwd: true,
		ignorePath: true, // does not append the src path of the route to the target host b/c we define it per route
		headers: {
			connection: 'keep-alive'
		}, 
		agent: http.globalAgent
	});


	// this.server.on('connection', function (socket) { 
	// 	logger.debug('server.on.connection - setNoDelay');
	// 	socket.setNoDelay(true); 
	// });

	var self = this;

	// define routes
	this.options.targets.forEach(function (target) { 
		logger.debug("Target: ", target);

		// add vhost for target if it exists in the config file 
		var app = self.app;
		findVHost.call(self, target.name, function(vhost) {
			logger.debug("Creating vhost:", vhost);
			if (vhost) { 
				app = connect(); // create new app for that vhost
				self.app.use(connectVhost(vhost, app)); // add vhost and "sub-app" to main app
			}
		});		

		addHttpRoutes.call(self, app, target);

	});

	this.proxy.on('error', function (res) {
			// if upgrade event isn't going to happen, close the socket
			logger.error(res);
		});

	// Listen to the `upgrade` event and proxy the WebSocket requests as well.
	// this.server.on('upgrade', function (req, socket, head) {	
	// 	logger.debug("proxyServer.ws: ", req.url, req.headers);

	// 	// self.app.use(connectRoute(function (router) {
	// 	// 	logger.debug("here");
	// 	// 	router.get("/mysocket", function (req, socket, next) {
	// 	// 		logger.debug("here2");

	// 	if (req.url === '/mysocket') {			
	// 		self.proxy.ws(req, socket, head, { target: "ws://localhost:9014/" }  );
	// 		//});
	// 	} else {
	// 		logger.debug("WebSocket request to %s not allowed", req.url);
	// 		socket.destroy();
	// 	}
	// 	//}));

	// });

}

/*
 * Add routes for an HTTP protocol
 */ 
function addHttpRoutes(app, target) {
	if (!(target.protocol && 
		    target.protocol.toLowerCase() === 'http'))
		return

	var self = this;

	// use the connect router middleware to handle the routes 
	// TODO test the performance and if no good, test with different one or write one ourselves.

	var targetEndpoint = util.format("%s://%s:%d", target.protocol, target.host, target.port);
	logger.debug("Target endpoint: ", targetEndpoint);
	var targetEndpointObject = { "target" :  targetEndpoint };

	app.use(connectRoute(function (router) {
		
		target.routes.forEach(function (route) {
			logger.debug("route: ", route);

			// set the correct target endpoint
			if (route.dest)
				targetEndpointObject.target = targetEndpoint + route.dest
			else
				targetEndpointObject.target = targetEndpoint + route.src

			// if (!route.methods) {
			// 	route.methods = [ "*" ]; // FIXME this is broken
			// }
			route.methods.forEach(function (method) {
				logger.debug("Add route for method: ", method);

				router.add(method, route.src, function (req, res, next) {
					logger.debug("Request headers: ", req.headers);
					self.proxy.web(req, res, targetEndpointObject );
				});
			});
		});
	}));

}

function findVHost(target, callback) {
	if (!this.options.vhosts)
		return;

	this.options.vhosts.forEach(function (vhost) {
		logger.debug("Available vhost targets: ", vhost.target);
		if (vhost.target.indexOf(target) >= 0)  {
			logger.debug("Found matching vhost target: ", target);
			callback(vhost.name);
		}
	});
}


module.exports = Gateway;
