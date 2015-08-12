(function () {
	'use strict';

	var IDriver = require('../utils/idriver'),
		DriverError = require('../utils/drivererror'),
		redis = require('redis'),
		// XXX new logging infrastructure not landed yet
		logger = require('winston'),
				// require("../../lib/logging"),
		util = require('util'),
		Promise = require('promise');

	var Redis = function () {
		// Provides slave and master url properties
		IDriver.apply(this, arguments);

		var slave = this.drivers.shift();
		var master = this.drivers.pop();

		// The principal redis client
		var clientReady = false;
		try { 
			var client = redis.createClient(slave.port || 6379, slave.hostname || '127.0.0.1');
		} catch (e) {
			logger.debug (e);
			this.emit(this.ERROR, new DriverError(DriverError.UNSPECIFIED, e));
			return;
		}

		var prefix = '';
		if (slave.hash) {
			prefix = slave.hash.substr(1);
		}

		var db;
		if (slave.path && (db = slave.path.substr(1))) {
			client.select(db);
		}
		var password;
		if (slave.auth && (password = slave.auth.split(':').pop())) {
			client.auth(password);
		}

		client.on('error', function (err) {
			logger.debug("Error in Redis driver: ", err);
			// Re-emit unspecified error as is
			this.emit(this.ERROR, new DriverError(DriverError.UNSPECIFIED, err));
		}.bind(this));

		client.on('ready', function (err) {
			clientReady = true;
			if (!clientWrite || clientWriteReady) {
				this.emit(this.READY, err);
			}
		}.bind(this));

		// The optional redis master
		var clientWriteReady = false;

		var clientWrite;

		if (master) {
			clientWrite = redis.createClient(master.port, master.hostname);

			if (master.path && (db = master.path.substr(1))) {
				clientWrite.select(db);
			}
			if (master.auth && (password = master.auth.split(':').pop())) {
				clientWrite.auth(password);
			}

			clientWrite.on('error', function (err) {
				// Re-emit unspecified error as is
				this.emit(this.ERROR, new DriverError(DriverError.UNSPECIFIED, err));
			}.bind(this));

			clientWrite.on('ready', function (err) {
				clientWriteReady = true;
				if (clientReady) {
					this.emit(this.READY, err);
				}
			}.bind(this));
		}

		// Redis specific: passiveChecks mechanism
		var passiveCheck = true;

		var monitorActiveChecker = function () {
			client.get('hchecker_ping', function (err, reply) {
				if (passiveCheck !== ((Math.floor(Date.now() / 1000) - reply) > 30)) {
					// XXX new logging infrastructure not landed yet
					// if (passiveCheck) {
					//     logger.info('Redis', 'Disabling passive checks (active hchecker detected).');
					// } else {
					//     logger.info('Redis', 'Enabling passive checks (active hchecker stopped).');
					// }
					passiveCheck = !passiveCheck;
				}
			});
		};

		var monitorPoller = setInterval(monitorActiveChecker, 30 * 1000);


		Object.defineProperty(this, 'connected', {
			get: function () {
				return client.connected && (!clientWrite || clientWrite.connected);
			}
		});

		var splitByFirstColon = function(string) {
			var index = string.indexOf(":");
			var s1 = string.substring(0, index);
			var s2 = string.substring(index + 1, string.length);
			return [s1, s2];
		};

		var queryBackends = function(endpoint, vhost, fulfill, reject) {
			var index = endpoint.indexOf(":");
			var baseKey = prefix + 'frontend:' + vhost;
			if (index >= 0) {
				var splitValue = splitByFirstColon(endpoint);
				var serviceID = endpoint.substring(0, index);
				var targetPath = endpoint.substring(index + 1, endpoint.length);

				// query backends and dead backend indices
				var multi = client.multi();
				multi.lrange(baseKey + ":" + serviceID, 0, -1);
				multi.smembers(baseKey + ":" + serviceID + ":dead");
				multi.exec(function (err, replies) {
					logger.debug("redis.read.%s.data: ", serviceID, replies);
					if (err) reject(err);
					else fulfill({
						"backends" : replies[0],
						"service" : serviceID,
						"dead" : replies[1] || [],
						"targetPath" : targetPath
					});
				});

			} else {
				// TODO check how to throw real error
				reject(util.format("Route is specified incorrectly: '%s', %s", endpoint));
			}
		};

		this.read = function (vhost, method, route) {  

			return new Promise(function (fulfill, reject) {
				var baseKey = prefix + 'frontend:' + vhost;
				var methodKey = baseKey + ':' + method.toLowerCase();

				logger.debug("redis.read: { key: %s, subkey: %s }", methodKey, route);

				client.hget(methodKey, route, function (err, data) {
					if (data) {
						logger.debug("redis.read.%s.data: ", method.toLowerCase(), data);
						queryBackends(data, vhost, fulfill, reject);

					} else {

						/* whu: If we don't find an exact match, regex-match the keys */
						client.hgetall(methodKey, function (err, data) {
							var found = false;
							if(data) {
								for(var path in data) {
									var mapping = data[path];

									var splitValue = splitByFirstColon(mapping);
									var endpointID = splitValue[0];
									var target = splitValue[1];

									var regex = new RegExp(path, "g");
									if(route.match(regex)) {
										var targetPath = route;
										if(path != target) {
											targetPath = route.replace(regex, target);
										}
										var key = endpointID + ":" + targetPath;
										found = true;
										return queryBackends(key, vhost, fulfill, reject);
									}
								}
							}
							if(!found) {
								// TODO check how to throw real error
								reject(util.format("Host '%s', method '%s' or path '%s' not defined.", vhost, method, route));
							}
						});
					}
				});            
			});
		};

		this.create = function (vhost, service, backends) {
			logger.debug("redis.create: { vhost: %s, service: %s, backend: %s }", vhost, service, JSON.stringify(backends));
			return new Promise(function (fulfill, reject) {
				client.rpush(prefix + 'frontend:' + vhost + ":" + service, backends, function (err, obj) {
					logger.debug("redis.create: ", obj);
					if (err) reject(err);
					else fulfill(obj);
				});
			});
		};

		/*
		 * Adds a route to a given vhost. 
		 */
		this.add = function(vhost, method, routeMap) {
			logger.debug("redis.add: { vhost: %s, method: %s, routeMap: %s }", vhost, method, JSON.stringify(routeMap));
			return new Promise(function (fulfill, reject) {
				var key = prefix + 'frontend:' + vhost + ':' + method.toLowerCase();
				client.hmset(key, routeMap, function (err, data) {
					logger.debug("redis.add: ", data);
					if (err) reject(err);
					else fulfill(data);
				});
			});
		}

		this.mark = function (frontend, service, id, url, len, ttl, callback) {
			var frontendKey = prefix + 'frontend:' + frontend + ":" + service + ":dead";
			var multi = (clientWrite ? clientWrite : client).multi();

			// Update the Redis only if passive checks are enabled
			if (passiveCheck) {
				multi.sadd(frontendKey, id);
				multi.expire(frontendKey, ttl);
			}
			// Announce the dead backend on the "dead" channel
			multi.publish('dead', frontend + ';' + service + ';' + url + ';' + id + ';' + len);
			multi.exec(callback);
		};

		this.destructor = function () {
			clearInterval(monitorPoller);
			client.end();
			if (clientWrite) {
				clientWrite.end();
			}
		};
	};

	util.inherits(Redis, IDriver);

	module.exports = Redis;

})();
