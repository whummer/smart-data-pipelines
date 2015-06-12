
var logger = require('winston'),
		colors = require('colors');
    fs = require('fs'),
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

	port = this.options.port || 80;

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
		this.app.use(require("connect-winston")(require('winston')));
	}

	// create proxy instance
	this.proxy = require('./http-proxy').createProxyServer({
		xfwd: true,
		ignorePath: true // does not append the src path of the route to the target host b/c we define it per route
	});

	var self = this;

	// define routes
	this.options.targets.forEach(function (target) { 
		logger.debug("Target: ", target);

		targetEndpoint = util.format("%s://%s:%d", target.protocol, target.host, target.port);
		logger.debug("Target endpoint: ", targetEndpoint);
		targetEndpointObject = { "target" :  targetEndpoint };

		// add vhost for target if existing
		var app = self.app;
		findVHost.call(self, target.name, function(vhost) {
			logger.debug("Creating vhost:", vhost);
			if (vhost) { 
				app = connect(); // create new app for that vhost
				self.app.use(connectVhost(vhost, app)); // add vhost and "sub-app" to main app
			}
		});		

		// use the connect router middleware to handle the routes 
		// TODO test the performance and if no good, test with different one or write one ourselves.
		//self.app.use(connectRoute(function (router) {
		app.use(connectRoute(function (router) {
	    
			target.routes.forEach(function (route) {
				logger.debug("route: ", route);

				// set the correct target endpoint
				if (route.dest)
					targetEndpointObject.target = targetEndpoint + route.dest
				else
					targetEndpointObject.target = targetEndpoint + route.src

				route.methods.forEach(function (method) {
					logger.debug("method: ", method);

					router.add(method, route.src, function (req, res, next) {
						logger.debug(req.headers);
						self.proxy.web(req, res, targetEndpointObject );
		  	  });
				});
			});
		}));
	});

	// start http(s)
	if (this.options.ssl) {
		
		this.server = require('https').createServer({
			key: fs.readFileSync(this.options.ssl.key, 'utf8'),
	  	cert: fs.readFileSync(this.options.ssl.cert, 'utf8')	  
	  },
		this.app);	

	} else {

		this.server = require('http').createServer(this.app);		
	}

}


function findVHost(target, callback) {
	if (!this.options.vhosts)
		return;

	this.options.vhosts.forEach(function (vhost) {

		if (vhost.target === target) {
			logger.debug("Found matching vhost target: ", target);
			callback(vhost.name);
		}
	});
}

module.exports = Gateway;
