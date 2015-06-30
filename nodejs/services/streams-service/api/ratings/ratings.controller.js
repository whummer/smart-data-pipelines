'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var util = require('riox-services-base/lib/util/util');
var Invocation = require('./invocation.model');
var RateLimit = require('./rate.limit.model');
var url = require('url');
var logger = require('winston');
var Client = require('node-rest-client').Client;
var LRUCache = require("lru-cache");
var riox = require('riox-shared/lib/api/riox-api');
require('riox-shared/lib/api/riox-api-admin')(riox);

var CACHE_SIZE_WARN_LEVEL = 2000000; // 2 MB cache size warning
var CACHE_SIZE_DROP_LEVEL = 5000000; // 5 MB max cache size
var CACHE_TTL = 1000*60*2; // 2 mins cache timeout

var KEY_ORGANIZATION = "__org__";
var KEY_API = "__api__";
var KEY_OPERATION = "__op__";
var KEY_USERS = "__usr__";
var KEY_LIMIT = "__lmt__";
var KEY_USED = "__use__";
var KEY_TIMESTAMP = "__tme__";
var KEY_ORGANIZATIONS = "__orgs__";
var KEY_APIS = "__apis__";

/* Example structure: 
 * 
 * {
 *   "platform.riox.io": {
 *     "__org__": { ... },
 *     "__api__": { ... },
 *     "GET:/api/v1/users": {
 *       "__api__": { ... },
 *       "__users__": {
 *         "abc123": {
 *           "__used__": 124123,
 *           "__limit__": 1000000000
 *         }
 *       }
 *     }
 *   },
 *   "tenant.riox.io": {
 *     ...
 *   }
 * }
 * 
 * */
var configCache = {};
var ipInfosCache = LRUCache({
	max: 500,
	maxAge: 1000 * 60 * 60 * 24
});


/* HELPER METHODS */

var getOrgForHost = function(host, callback) {
	var subdomain = host.split(/\./).slice(-3, 1)[0];
	var query = { all: true };
	var orgsCache = getCacheEntry(configCache, KEY_ORGANIZATIONS);
	riox.organizations(query, {
		headers: auth.getInternalCallTokenHeader(),
		callback: function(orgs) {
			var found = false;
			for(var i = 0; i < orgs.length; i ++) {
				var org = orgs[i];
				if(org[DOMAIN_NAME] == subdomain) {
					found = org;
				}
			}
			callback(found);
		},
		cache: orgsCache
	});
};
var getSourceForPath = function(method, org, path, callback) {
	var query = {};
	query[ORGANIZATION_ID] = org[ID];
	var apisCache = getCacheEntry(configCache, KEY_APIS);
	riox.streams.sources.all(query, {
		headers: auth.getInternalCallTokenHeader(),
		callback: function(list) {
			var found = false;
			/* TODO: whu: move functionality into microservice */
			for(var i = 0; i < list.length; i ++) {
				var item = list[i];
				for(var j = 0; j < item[OPERATIONS].length; j ++) {
					var op = item[OPERATIONS][j];
					if(op[HTTP_METHOD] == method) {
						var regex = new RegExp(op[URL_PATH]);
						if(path.match(regex)) {
							if(found) {
								logger.warn("Path", path, "matches more than one API " +
										"for organization", org[ID], ":", 
										op[URL_PATH], ",", found[KEY_OPERATION][URL_PATH]);
							}
							found = {};
							found[KEY_API] = item;
							found[KEY_OPERATION] = op;
						}
					}
				}
			}
			if(!found) {
				logger.warn("API operation not found for organization", org[ID], ":", method, path);
			}
			callback(found);
		},
		cache: apisCache
	});
};
var getSourceForURL = function(method, host, path, query, callback) {
	var result = {};
	getOrgForHost(host, function(org) {
		result[KEY_ORGANIZATION] = org;
		getSourceForPath(method, org, path, function(res) {
			result[KEY_API] = res[KEY_API];
			result[KEY_OPERATION] = res[KEY_OPERATION];
			callback(result);
		})
	});
};

var returnAndSave = function(invocationObj, status, res, cacheForPath) {
	var invocationID = undefined;
	if(status == STATUS_PERMITTED) {
		var disableLog = cacheForPath[KEY_OPERATION] && cacheForPath[KEY_OPERATION][DISABLE_LOG];
		if(!disableLog) {
			invocationObj[ID] = invocationObj["_id"] = invocationID = util.genShortUUID();
			if(cacheForPath[KEY_OPERATION]) {
				invocationObj[OPERATION_ID] = cacheForPath[KEY_OPERATION][ID];
			}
			/* get IP address */
			var ip = invocationObj[SOURCE_IP];
			if(ipInfosCache.get(ip)) {
				invocationObj[SOURCE_COUNTRY] = ipInfosCache.get(ip).countryCode || "-";
			}
			/* save invocation */
			invocationObj.save(function(err, obj) {
				if(err)
					return res.status(500).json({error: "Unable to save invocation: " + err});
				/* deterimine IP address */
				if(!obj[SOURCE_COUNTRY]) {
					getIPInfo(obj[SOURCE_IP], function(info) {
						obj[SOURCE_COUNTRY] = info.countryCode;
						ipInfosCache.set(ip, info || {});
						obj.save();
					});
				}
			});
		}
	}
	var response = {};
	response[STATUS] = status;
	response[INVOCATION_ID] = invocationID;
	/* return result */
	res.json(response);
};

var checkPublicAccess = function(cacheForPath, userID) {
	if(cacheForPath[KEY_API]) {
		if(!userID && !cacheForPath[KEY_API][PUBLIC_ACCESS]) {
			logger.info("Blocking public access attempt to API", cacheForPath[KEY_API][ID]);
			return false;
		}
	}
	return true;
};
var checkAccessLimits = function(cacheForUsers, userID) {
	if(userID) {
		var cacheOfUser = cacheForUsers[userID];
		if(cacheOfUser[KEY_LIMIT] >= 0 && cacheOfUser[KEY_USED] > cacheOfUser[KEY_LIMIT]) {
			return STATUS_DENIED;
		}
		cacheOfUser[KEY_USED] ++;
	}
	return STATUS_PERMITTED;
};

var isOverTTL = function(time, ttl) {
	if(!ttl) ttl = CACHE_TTL;
	var now = new Date().getTime();
	return (time + ttl) < now;
};
var resetCache = function() {
	configCache = {};
};
var checkCache = function() {
	/* do this only occasionally because size 
	 * calculation is computationally rather expensive */
	if(Math.random() < 0.98) {
		return;
	}
	/* check size */
	var size = util.estimateObjectSize(configCache);
	if(size > CACHE_SIZE_DROP_LEVEL) {
		logger.info("Resetting cache because it has grown too large: " + size + " (bytes)");
		resetCache();
		return;
	}
	if(size > CACHE_SIZE_WARN_LEVEL) {
		logger.warn("Cache size is " + size + " (bytes) - will reset it soon, max. size is " + CACHE_SIZE_DROP_LEVEL);
	}
};
var getCacheEntry = function(cache, key) {
	if(cache[key]) {
		if(isOverTTL(cache[key][KEY_TIMESTAMP])) {
			//console.log("Cache key " + key + " is over TTL, deleting...")
			delete cache[key];
		}
	}
	if(!cache[key]) {
		cache[key] = {};
		cache[key][KEY_TIMESTAMP] = new Date().getTime();
	}
	return cache[key];
};

/* BEGIN API METHODS */

exports.logAndPermit = function(req, res) {
	var inv = new Invocation();
	inv[TIMESTAMP] = new Date();
	var userID = req.body[USER_ID];
	var u = url.parse(req.body[URL]);
	inv[HOST] = u.host;
	inv[URL_PATH] = u.pathname;
	inv[HTTP_METHOD] = req.body[HTTP_METHOD];
	inv[USER_ID] = userID || undefined;
	inv[URL_QUERY] = u.query || undefined;
	inv[SOURCE_IP] = req.body[SOURCE_IP] || undefined;

	if(!configCache[u.host]) configCache[u.host] = {};
	var cacheForHost = configCache[u.host];
	var pathKey = req.body[HTTP_METHOD] + ":" + u.pathname;
	var cacheForPath = getCacheEntry(cacheForHost, pathKey);
	if(!cacheForPath[KEY_USERS]) cacheForPath[KEY_USERS] = {};
	var cacheForUsers = cacheForPath[KEY_USERS];

	/* check cache size */
	checkCache();

	/* check public access in cache */
	var isPublicAccess = !userID;
	if(!checkPublicAccess(cacheForPath, userID)) {
		return returnAndSave(inv, STATUS_DENIED, res, cacheForPath);
	}
	/* check access limits in cache */
	if(cacheForUsers[userID]) {
		var status = checkAccessLimits(cacheForUsers, userID);
		return returnAndSave(inv, status, res, cacheForPath);
	}

	var cacheOfUser = cacheForUsers[userID] = {};

	/* Not all info available in the cache yet -> fetch API info from service */
	getSourceForURL(inv[HTTP_METHOD], u.host, u.pathname, u.query, function(result) {

		cacheForPath[KEY_API] = result[KEY_API];
		cacheForPath[KEY_OPERATION] = result[KEY_OPERATION];
		if(!cacheForPath[KEY_OPERATION]) {
			return returnAndSave(inv, STATUS_UNKNOWN, res, cacheForPath);
		}

		getLimitForUserAndOp(userID, result[KEY_OPERATION][ID], function(limits) {
			console.log("limits", limits);
			var limit = limits[0];
			if(limit) {
				cacheOfUser[KEY_LIMIT] = limit; // TODO
				cacheOfUser[KEY_USED] = 0; // TODO
			} else {
				cacheOfUser[KEY_LIMIT] = -1;
				cacheOfUser[KEY_USED] = 0;
			}

			/* NOW ALL DATA IN THE CACHE IS AVAILABLE, CHECK AGAIN */

			/* check public access in cache */
			var isPublicAccess = !userID;
			if(!checkPublicAccess(cacheForPath, userID)) {
				return returnAndSave(inv, STATUS_DENIED, res, cacheForPath);
			}
			/* check access limits in cache */
			var status = checkAccessLimits(cacheForUsers, userID);
			return returnAndSave(inv, status, res, cacheForPath);
		});
	});
};

exports.showLimits = function(req, res) {
	var query = {};
	RateLimit.find(query, function(err, list) {
		if(err) return res.status(500).json({error: "Cannot load rate limits: " + err});
		res.json(list);
	});
};

exports.queryLimits = function(req, res) {
	var id = req.params.id;
	var query = {};
	query[USER_ID] = req[USER_ID] || undefined;
	query[OPERATION_ID] = req[OPERATION_ID] || undefined;
	query[ACCESSROLE_ID] = req[ACCESSROLE_ID] || undefined;
	query[TYPE] = req[TYPE] || undefined;
	queryLimits(userId, function(limits) {
		res.json(limits);
	});
};

var getLimitForUserAndOp = function(userId, operationId, callback) {
	var query = {};
	query[USER_ID] = userId;
	query[OPERATION_ID] = operationId;
	queryLimits(query, callback);
};
var queryLimits = function(query, callback) {
	RateLimit.find(query, function(err, limits) {
		callback(limits);
	});
};

var checkLimitEntity = function(req, res) {
	var id = req.params.id;
	if(id && id != req.body[ID]) {
		res.status(400).json({error: "Please provide a valid " + ID});
		return false;
	}
	if(!req.body[OPERATION_ID]) {
		res.status(422).json({error: "Please provide a valid operation for this rate limit"});
		return false;
	}
	if(!req.body[TIMEUNIT]) {
		res.status(422).json({error: "Please provide a valid time unit for this rate limit"});
		return false;
	}
	if(!req.body[CONSUMER_ID] && !req.body[ACCESSROLE_ID]) {
		res.status(422).json({error: "Please provide either a consumer or an access role for this rate limit"});
		return false;
	}
	if(!isNumber(req.body[AMOUNT])) {
		res.status(422).json({error: "Please provide a valid numeric " + AMOUNT});
		return false;
	}
	return true;
};

exports.saveLimit = function(req, res) {
	var id = req.params.id;
	if(!checkLimitEntity(req, res)) {
		return;
	}
	/* TODO check authorization */
	RateLimit.findById(id, function(err, limit) {
		if(err || !limit) {
			return res.status(500).json({error: "Cannot load rate limit with ID " + id});
		}
		/* copy values */
		limit[OPERATION_ID] = req.body[OPERATION_ID];
		limit[CONSUMER_ID] = req.body[CONSUMER_ID];
		limit[ACCESSROLE_ID] = req.body[ACCESSROLE_ID];
		limit[TYPE] = req.body[TYPE];
		limit[TIMEUNIT] = req.body[TIMEUNIT];
		limit[AMOUNT] = req.body[AMOUNT];
		/* save */
		limit.save(function(err, limit) {
			res.json(limit);
			/* we need to reset the cache 
			 * (TODO: reset only the relevant parts) */
			resetCache();
		})
	});
};

exports.addLimit = function(req, res) {
	var user = auth.getCurrentUser(req);
	var limit = new RateLimit(req.body);

	if(!checkLimitEntity(req, res)) {
		return;
	}

	/* TODO check authorization */
	limit[CREATION_DATE] = new Date();
	limit[CREATOR_ID] = user[ID];
	limit.save(function(err, limit) {
		if(err) return res.status(500).json({error: "Cannot add rate limit: " + err});
		res.json(limit);
		/* we need to reset the cache 
		 * (TODO: reset only the relevant parts) */
		resetCache();
	});
};

exports.deleteLimit = function(req, res) {
	var id = req.params.id;
	/* TODO check authorization */
	RateLimit.findById(id, function(err, limit) {
		if(err || !limit)
			return res.status(500).json({error: "Cannot find rate limit with ID " + id});
		limit.remove(function(err, result) {
			res.json(result);
			/* we need to reset the cache 
			 * (TODO: reset only the relevant parts) */
			resetCache();
		});
	});
};

/* METHODS FOR ACCESS TO INVOCATIONS */

var toDateString = function(date) {
	if(!date.toISOString) date = new Date(date);
	return date.toISOString();
}

exports.queryInvocations = function(req, res) {
	var user = auth.getCurrentUser(req);
	var query = {};
	if(req.body[OPERATION_ID]) {
		query[OPERATION_ID] = {
				"$in": req.body[OPERATION_ID]
		};
	}
	var from = req.body[TIME_FROM];
	var to = req.body[TIME_TO];
	if(!to) {
		to = new Date().getTime();
	}
	if(!from) {
		from = new Date(to - 1000*60*60*24);
	}
	query[TIMESTAMP] = {
		"$gte": toDateString(from),
		"$lt":  toDateString(to)
	};

	Invocation.find(query, function(err, invocations) {
		//console.log("ratings.invs:", invocations);
		if(err || !invocations)
			return res.status(500).json({error: "Unable to query for invocations."});
		var resultMap = {};
		var resultArray = [];
		for(var i = 0; i < invocations.length; i ++) {
			var inv = invocations[i];
			var key = inv[USER_ID] + inv[HTTP_METHOD] + inv[URL_PATH] + inv[URL_QUERY];
			if(!resultMap[key]) {
				inv = JSON.parse(JSON.stringify(inv)); // clone
				resultMap[key] = inv;
				inv.count = 1;
				inv.ips = {};
				inv.ips[inv[SOURCE_IP]] = {
						country: inv[SOURCE_COUNTRY],
						timestamps: [inv[TIMESTAMP]],
						resultStatus: [inv[RESULT_STATUS]]
				};
				delete inv[TIMESTAMP];
				delete inv[SOURCE_IP];
				resultArray.push(inv);
			} else {
				var item = resultMap[key];
				var ip = inv[SOURCE_IP];
				if(!item.ips[ip]) {
					item.ips[ip] = {
						country: inv[SOURCE_COUNTRY],
						timestamps: [],
						resultStatus: []
					};
				}
				if(!item.ips[ip].country) {
					item.ips[ip].country = inv[SOURCE_COUNTRY];
				}
				item.ips[ip].timestamps.push(inv[TIMESTAMP]);
				item.ips[ip].resultStatus.push(inv[RESULT_STATUS]);
				item.count ++;
			}
		}
		res.json(resultArray);
	});
};

exports.updateInvocation = function(req, res) {
	Invocation.findById(req.params.id, function(err, inv) {
		if(err || !inv)
			return res.status(500).json({error: "Unable to update invocation: " + err});
		inv[RESULT_STATUS] = req.body[RESULT_STATUS];
		inv.save(function(err, result) {
			res.json({});
		});
	});
};

/* HELPER METHODS */

var isNumber = function(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
};

var getIPInfo = function(ip, callback) {
	var url = "http://www.telize.com/geoip/" + ip;
	var client = new Client();
	logger.info("Getting source country for IP address:", ip);
	client.get(url, function(data, response){
        var result = {};
        data = data.toJSON ? JSON.parse(data.toString()) : data;
        result.countryCode = data["country_code"];
        callback(result);
    });
};
