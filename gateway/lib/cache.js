
'use strict';

/*
 * This module handles all IO called on the cache (currently Redis)
 */

var url = require('url'),
    factory = require('./drivers/factory'),
    logger = require('winston'),
    LruCache = require('./lru');

function Cache(config, handlers) {
    if (!(this instanceof Cache)) {
        return new Cache(config, handlers);
    }

    var logHandler = handlers.logHandler || console.log,
        debugHandler = handlers.debugHandler || console.log;
    this.config = config;

    this.log = function (msg) {
        logHandler('Cache: ' + msg);
    };
    this.debug = function (msg) {
        debugHandler('Cache: ' + msg);
    };

    var driverArray = (global.config.driver instanceof Array) ? global.config.driver : [global.config.driver];
    this.client = factory.getDriver(driverArray);

    this.client.on('error', function (err) {
        this.log('DriverError ' + err);
    }.bind(this));

    // LRU cache for Redis lookups
    this.lru = new LruCache();
    this.lru.enabled = config.server.lruCache;
}

/*
 * This method mark a dead backend in the cache by its backend id
 */
Cache.prototype.markDeadBackend = function (backendInfo) {
    logger.debug("cache.markDeadBackend: ", JSON.stringify(backendInfo));

    this.client.mark(
        backendInfo.frontend,
        backendInfo.service,
        backendInfo.backendId,
        backendInfo.backendUrl,
        backendInfo.backendLen,
        this.config.server.deadBackendTTL,
        function () {}
    );

    // A dead backend invalidates the LRU
    var cacheKey = backendInfo.frontend + ":" + backendInfo.requestMethod.toLowerCase() + ":" + backendInfo.sourcePath;
    this.lru.del(cacheKey);
};

/*
 * This method is an helper to get the domain name (to a given depth for subdomains)
 * TODO FR: not sure where we need this method - don't understand the purpose
 */
Cache.prototype.getDomainsLookup = function (hostname) {
    var parts = hostname.split('.');
    var result = [parts.join('.')];
    var n;
    // Prevent abusive lookups
    while (parts.length > 6) {
        parts.shift();
    }
    while (parts.length > 1) {
        parts.shift();
        n = parts.join('.');
        result.push('*.' + n);
    }
    result.push('*');
    return result;
};


// /*
//  * This method picks up a backend randomly and ignore dead ones.
//  * The parsed URL of the chosen backend is returned.
//  * The method also decides which HTTP error code to return according to the
//  * error.
//  */
// Cache.prototype.getBackendFromHostHeader = function (host, callback) {
//     if (host === undefined) {
//         return callback('no host header', 400);
//     }
//     if (host === '__ping__') {
//         return callback('ok', 200);
//     }
//     var index = host.indexOf(':');
//     if (index > 0) {
//         host = host.slice(0, index).toLowerCase();
//     }

//     var readFromCache = function (hostKey, cb) {
//         // Let's try the LRU cache first
//         var rows = this.lru.get(hostKey);
//         if (rows) {
//             return cb(rows.slice(0));
//         }

//         // The entry is not in the LRU cache, let's do a request on Redis
//         this.client.read(this.getDomainsLookup(hostKey), function (err, rows) {
//             this.lru.set(hostKey, rows);
//             cb(rows.slice(0));
//         }.bind(this));
//     }.bind(this);

//     readFromCache(host, function (rows) {
//         logger.debug("Rows: ", rows);
//         var deads = rows.pop();
//         var backends = rows.shift();
//         while (rows.length && !backends.length) {
//             backends = rows.shift();
//         }
//         if (!backends.length) {
//             return callback('frontend not found', 400);
//         }
//         var virtualHost = backends[0];
//         backends = backends.slice(1); // copy to not modify the lru in place
//         logger.debug("Backends: ", backends);

//         var indexes = [];
//         backends.forEach(function (bcd, idx) {
//             if (deads.indexOf(idx) === -1) {
//                 indexes.push(idx);
//             }
//         });

//         if (!indexes.length) {
//             return callback('Cannot find a valid backend', 502);
//         }

//         var index = indexes[Math.floor(Math.random() * indexes.length)];
//         var backend = url.parse(backends[index]);
//         backend.id = index; // Store the backend index
//         backend.frontend = host; // Store the associated frontend
//         backend.virtualHost = virtualHost; // Store the associated vhost
//         backend.len = backends.length;
//         if (!backend.hostname) {
//             return callback('backend is invalid', 502);
//         }
//         backend.port = backend.port ? parseInt(backend.port, 10) : 80;
//         callback(false, 0, backend);

//     }.bind(this));
// };


/*
 * This method picks up a backend randomly and ignore dead ones.
 * The parsed URL of the chosen backend is returned.
 * The method also decides which HTTP error code to return according to the
 * error.
 */
Cache.prototype.getBackend = function (host, method, sourcePath, callback) {

    if (host === undefined) {
        return callback('no host header', 400);
    }
    if (host === '__ping__') {
        return callback('ok', 200);
    }
    var index = host.indexOf(':');
    if (index > 0) {
        host = host.slice(0, index).toLowerCase();
    }

    // Let's try the LRU cache first
    var cacheKey = host + ":" + method.toLowerCase() + ":" + sourcePath;
    
    logger.debug("LRU cache route read: '%s'", cacheKey);

    // Let's try the LRU cache first
    var target = this.lru.get(cacheKey);
    if (target) {
        logger.debug("Cache hit: ", target);
        return callback(false, 0, target);
    } else {
        logger.debug("Cache miss: %s", target);
    }
    // The entry is not in the LRU cache, let's do a request on Redis
    this.client.read(host, method, sourcePath)
        .then(function (result) {
            logger.debug('client.read.result: ', JSON.stringify(result));

            var indexes = [];
            result.backends.forEach(function (bcd, idx) {
                if (result.dead.indexOf(idx) === -1) {
                     indexes.push(idx);
                }
            });

            logger.debug("cache.client.read.indexes: ", indexes);
            logger.debug("cache.client.read.backends:", result.backends);

            var index = indexes[Math.floor(Math.random() * indexes.length)];
            var backend = url.parse(result.backends[index]);
            backend.id = index; // Store the backend index
            backend.frontend = host; // Store the associated frontend
            backend.service = result.service;
            backend.requestMethod = method;
            backend.sourcePath = sourcePath;
            backend.len = result.backends.length;
            backend.targetPath = result.targetPath;
            if (!backend.hostname) {
                return callback('backend is invalid', 502);
            }
            backend.port = backend.port ? parseInt(backend.port, 10) : 80;

            this.lru.set(cacheKey, backend);

            callback(false, 0, backend);
        }.bind(this))
        .catch(function (err) {
        	if(method != "OPTIONS") { /* don't alert if this is a CORS request */
        		logger.error("client.read.error: ", err);
        	}
            callback(err, 404);
        });

};

module.exports = Cache;
