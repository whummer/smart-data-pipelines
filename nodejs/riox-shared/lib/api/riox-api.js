/**
 * @author whummer
 */

(function() {

/* CONFIGURATIONS */

/**
 * openConnectionPerRequest
 *  	if true, open a websocket connection for each subscription,
 *  	if false, re-use a single websocket connection (TODO implement)
 */
var openConnectionPerRequest = true;
var ttl = 15000;

/* END OF CONFIGURATIONS */

/* Global riox object to hook all methods onto */
var sh = {};

/* GLOBAL CONSTANTS: names for model properties */
var g = {};

g.ID = "id";
g.NAME = "name";
g.DESCRIPTION = "description";
g.CREATION_DATE = "creation-date";
g.CREATOR_ID = "creator-id";
g.OWNER_ID = "owner-id";
g.THING_TYPE = "thing-type";
g.THING_ID = "thing-id";
g.THINGS = "things";
g.PROPERTIES = "properties";
g.PROPERTY_ID = "property-id";
g.PROPERTY_NAME = "property";
g.PROPERTY_VALUE = "value";
g.PROPERTY_TYPE = "data-type";
g.TIMESTAMP = "timestamp";
g.IMAGE_DATA = "image-data";
g.SIMULATION_ID = "simulation-id";
g.START_TIME = "start-time";
g.END_TIME = "end-time";
g.USER_ID = "user-id";
g.STREAM_ID = "stream-id";
g.SOURCE_ID = "source-id";
g.SINK_ID = "sink-id";
g.ORGANIZATION_ID = "organization-id";
g.PROCESSORS = "processors";
g.REQUESTOR_ID = "requestor-id";
g.CONNECTOR = "connector";
g.STATUS = "status";
g.CREATED = "created";
g.CHANGED = "changed";
g.STATUS_REQUESTED = "REQUESTED";
g.STATUS_PENDING = "PENDING";
g.STATUS_CONFIRMED = "CONFIRMED";
g.STATUS_PERMITTED = "PERMITTED";
g.STATUS_DENIED = "DENIED";

var shareHook = (typeof window != "undefined") ? window : global;
for(key in g) {
	shareHook[key] = sh[key] = g[key];
}


/* initialize authentication info */
sh.login = function(options, callback, errorCallback) {
	var shaObj = new jsSHA(options.password, "TEXT");
	options.password = shaObj.getHash("SHA-256", "HEX");
	callPOST(servicesConfig.services.users.url + "/login", options, callback, errorCallback);
};
var assertAuth = function() {
	var ok = sh.authToken &&
			((sh.authToken.userId && sh.authToken.appKey) ||
			(sh.authToken.network && sh.authToken.access_token));
	if(!ok) {
		console.log(sh.authToken);
		console.trace();
		throw "Please provide valid authentication information.";
	}
};

/* register/authenticate user */

sh.activate = function(actKey, callback, errorCallback) {
	var req = {activationKey: actKey};
	return callPOST(servicesConfig.services.users.url + "/activate", req, callback, errorCallback);
};
sh.signup = function(userInfo, callback, errorCallback) {
	return callPOST(servicesConfig.services.users.url + "/", userInfo, callback, errorCallback);
};
sh.signin = function(userInfo, callback, errorCallback) {
	return callPOST(servicesConfig.services.users.url + "/auth/local", userInfo, callback, errorCallback);
};
sh.auth = function(options, callback, errorCallback) {
	var authToken = sh.authToken = {};
	authToken.userId = (options && options.RIOX_USER_ID) ? options.RIOX_USER_ID : (typeof window != "undefined") ? window.RIOX_USER_ID : undefined;
	authToken.appKey = (options && options.RIOX_APP_KEY) ? options.RIOX_APP_KEY : (typeof window != "undefined") ? window.RIOX_APP_KEY : undefined;
	authToken.network = (options && options.RIOX_AUTH_NETWORK) ? options.RIOX_AUTH_NETWORK : (typeof window != "undefined") ? window.RIOX_AUTH_NETWORK : undefined;
	authToken.access_token = (options && options.RIOX_AUTH_TOKEN) ? options.RIOX_AUTH_TOKEN : (typeof window != "undefined") ? window.RIOX_AUTH_TOKEN : undefined;
	assertAuth();
	var __defaultHeaders = {
		"Content-Type": "application/json",
		"riots-auth-user-id": authToken.userId,
		"riots-auth-app-key": authToken.appKey,
		"riots-auth-network": authToken.network,
		"riots-auth-token": authToken.access_token,
		"authorization": "Bearer " + authToken.access_token
	};
	$.ajaxSetup({
	    headers: __defaultHeaders
	});
	var funcSuccess = function(result) {
		console.log("Authentication successful.", result);
		if(callback) {
			callback(result);
		}
	};
	var funcError = function(result) {
		console.log("Authentication error.");
		if(errorCallback) {
			errorCallback(result);
		}
	};
	if(authToken.appKey) {
		riots.app({
			appKey: authToken.appKey
		}, funcSuccess, funcError);
	} else {
		var authToken = {
				network: authToken.network,
				token: authToken.access_token
		};
		callPOST(servicesConfig.services.users.url + "/auth", authToken, funcSuccess, funcError);
	}
};

/* methods for GETting data */

sh.get = {};

sh.app = sh.get.app = function(opts, callback, errorCallback) {
	if(!opts) {
		if(callback) callback(null);
		return null;
	}
	var path = "/" + opts;
	if(opts.appKey) {
		path = "/by/appKey/" + opts.appKey;
	}
	return callGET(servicesConfig.services.apps.url + path, callback, errorCallback);
};
sh.me = function(callback, errorCallback) {
	return callGET(servicesConfig.services.users.url + "/me", callback, errorCallback);
};
sh.users = sh.get.users = function(callback, errorCallback) {
	return callGET(servicesConfig.services.users.url, callback, errorCallback);
};
sh.user = sh.get.user = function(query, callback, errorCallback) {
	var url = servicesConfig.services.users.url;
	if(query.id) {
		url += "/" + query.id;
	} else {
		throw "invalid user query";
	}
	return callGET(url, callback, errorCallback);
};
sh.actions = sh.get.actions = function(opts, callback, errorCallback) {
	return callPOST(servicesConfig.services.users.url + "/actions/query", opts, callback, errorCallback);
};
sh.apps = sh.get.apps = function(callback, errorCallback) {
	return callGET(servicesConfig.services.apps.url, callback, errorCallback);
};
sh.thingType = sh.get.thingType = function(id, callback, errorCallback) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(servicesConfig.services.thingTypes.url + "/" + id, callback, errorCallback);
};
sh.thingTypes = sh.get.thingTypes = function(callback, errorCallback) {
	var maxThings = 100;
	return callGET(servicesConfig.services.thingTypes.url + "?page=0&size=" + maxThings, callback, errorCallback);
};
sh.things = sh.get.things = function(opts, callback, errorCallback) {
	if(!opts) opts = {};
	var maxResults = opts.maxResults ? opts.maxResults : 100;
	var suffix = "?page=0&size=" + maxResults;
	if(opts.appId) {
		suffix = "/by/application/" + opts.appId;
	}
	return callGET(servicesConfig.services.things.url + suffix, callback, errorCallback);
};
sh.thing = sh.get.thing = function(id, callback, errorCallback) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(servicesConfig.services.things.url + "/" + id, callback, errorCallback);
};
sh.triggers = sh.get.triggers = function(callback, errorCallback) {
	return callGET(servicesConfig.services.triggers.url, callback, errorCallback);
};

sh.stream = {};
sh.streams = {};
sh.get.streams = {};
sh.streams.sources = sh.get.streams.sources = function(searchOpts, callback, errorCallback) {
	var url = servicesConfig.services.streams.url + "/sources";
	if(searchOpts && typeof searchOpts.query != "undefined") {
		url += "/query";
		return callPOST(url, searchOpts, callback, errorCallback);
	}
	return callGET(url, callback, errorCallback);
};
sh.streams.source = sh.get.streams.source = function(id, callback, errorCallback) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(servicesConfig.services.streams.url + "/sources/" + id, callback, errorCallback);
};
sh.streams.consumed = function(searchOpts, callback, errorCallback) {
	var url = servicesConfig.services.streams.url + "/consumed";
	return callGET(url, callback, errorCallback);
};
sh.streams.provided = function(searchOpts, callback, errorCallback) {
	var url = servicesConfig.services.streams.url + "/provided";
	return callGET(url, callback, errorCallback);
};

sh.sinks = sh.get.sinks = function(searchOpts, callback, errorCallback) {
	var url = servicesConfig.services.streamsinks.url;
	//url += "?creatorId=" + window.RIOX_USER_ID;
	return callGET(url, callback, errorCallback);
};

sh.manufacturers = sh.get.manufacturers = function(callback, errorCallback) {
	return callGET(servicesConfig.services.manufacturers.url, callback, errorCallback);
};
sh.stats = sh.get.stats = function(opts, callback, errorCallback) {
	var url = buildQueryURL(servicesConfig.services.stats.url, opts);
	return callGET(url, callback, errorCallback);
};
sh.simulationTypes = sh.get.simulationTypes = function(callback, errorCallback) {
	var maxResults = 100;
	return callGET(servicesConfig.services.simulationTypes.url + "?page=0&size=" + maxResults, callback, errorCallback);
};

sh.simulations = sh.get.simulations = function(callback, errorCallback) {
	var maxResults = 100;
	return callGET(servicesConfig.services.simulations.url + "?page=0&size=" + maxResults, callback, errorCallback);
};

sh.simulationByThingIdAndPropertyName = sh.get.simulationByThingIdAndPropertyName = function(opts, callback, errorCallback) {
	var maxResults = 100;
	var thingId = opts.thingId;
	var propertyName = opts.propertyName;
	return callGET(servicesConfig.services.simulations.url + "?page=0&size=" + maxResults + "&thingId="
	+ thingId + "&propertyName=" + propertyName, callback, errorCallback);
};

sh.data = sh.get.data = function(opts, callback, errorCallback) {
	var url = servicesConfig.services.thingData.url + "/" +
                      opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	if(opts.amount) {
		url += "/history?amount=" + opts.amount;
	}
	return callGET(url, callback, errorCallback);
};
sh.config = sh.get.config = function(callback, errorCallback) {
	assertAuth();
	var url = servicesConfig.services.users.url + "/by/email/" + authInfo.email + "/config";
	return callGET(url, callback, errorCallback);
};
sh.driver = sh.get.driver = function(opts, callback, errorCallback) {
	var url = servicesConfig.services.drivers.url + "/forThing/" +
                      opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	return callGET(url, callback, errorCallback);
};
sh.plans = sh.get.plans = function(callback, errorCallback) {
	var url = servicesConfig.services.billing.url + "/plans";
	return callGET(url, callback, errorCallback);
};
sh.organizations = sh.get.organizations = function(callback, errorCallback) {
	var url = servicesConfig.services.organizations.url;
	return callGET(url, callback, errorCallback);
};
sh.organization = sh.get.organization = function(org, callback, errorCallback) {
	var id = org.id ? org.id : org;
	var url = servicesConfig.services.organizations.url + "/" + id;
	return callGET(url, callback, errorCallback);
};
sh.access = sh.get.access = function(query, callback, errorCallback) {
	if(typeof callback == "undefined") {
		callback = query;
		query = {};
	}
	var streamId = query.streamId;
	var url = servicesConfig.services.access.url + (streamId ? ("/stream/" + streamId) : "");
	return callGET(url, callback, errorCallback);
};
sh.usage = sh.get.usage = function(callback, errorCallback) {
	var url = servicesConfig.services.users.url + "/me/usage";
	return callGET(url, callback, errorCallback);
};
sh.properties = sh.get.properties = function(thingType, callback, errorCallback) {
	var maxThings = 100;
	if(!thingType.id) {
		sh.thingType(thingType, function(thingTypeObj) {
			sh.properties(thingTypeObj, callback);
		});
		return;
	}
	/* recurse into sub-types */
	if(thingType.children) {
		$.each(thingType.children, function(idx,el) {
			sh.properties(el, callback);
		});
	}
	if(!thingType.properties) {
		thingType.properties = [];
	}
	callback(thingType.properties, thingType);
	/* recurse into sub-properties */
	if(thingType.properties) {
		var recurseProps = function(prop, callback, propNamePrefix) {
			if(prop.children) {
				$.each(prop.children, function(idx,subProp) {
					subProp = clone(subProp);
					subProp.name = propNamePrefix + subProp.name;
					callback([subProp], thingType);
					recurseProps(subProp, callback, subProp.name + ".");
				});
			}
		}
		$.each(thingType.properties, function(idx,prop) {
			recurseProps(prop, callback, prop.name + ".");
		});
	}
};

sh.propertiesRecursive = function(props, includeComplexProps) {
	return doGetPropertiesRecursive(props, undefined, undefined, includeComplexProps);
}
var doGetPropertiesRecursive = function(props, result, propNamePrefix, includeComplexProps) {
	if(!result) result = [];
	if(!propNamePrefix) propNamePrefix = "";
	$.each(props, function(idx,prop) {
		if(prop.children) {
			$.each(prop.children, function(idx,subProp) {
				subProp = clone(subProp);
				subProp.name = propNamePrefix + subProp.name;
				sh.propertiesRecursive([subProp], result, subProp.name + ".", includeComplexProps);
			});
		}
		if(includeComplexProps || !prop.children) {
			result.push(prop);
		}
	});
	return result;
};

var buildQueryURL = function(baseURL, opts) {
	if(!opts) opts = {};
	var url = baseURL;
	if(opts.type) url += "/" + opts.type;
	url += "?";
	if(opts.query) url += "&q=" + opts.query;
	if(opts.from) url += "&from=" + opts.from;
	if(opts.to) url += "&to=" + opts.to;
	if(opts.period) url += "&period=" + opts.period;
	return url;
};

/* methods for POSTing data */

sh.add = {};

  sh.add.thingType = function(thingType, callback, errorCallback) {
	return callPOST(servicesConfig.services.thingTypes.url, thingType, callback, errorCallback);
};
sh.add.app = function(app, callback, errorCallback) {
	return callPOST(servicesConfig.services.apps.url, app, callback, errorCallback);
};
sh.add.thing = function(thing, callback, errorCallback) {
	return callPOST(servicesConfig.services.things.url, thing, callback, errorCallback);
};
sh.add.simulationType = function(simType, callback, errorCallback) {
	return callPOST(servicesConfig.services.simulationTypes.url, simType, callback, errorCallback);
};
sh.add.trigger = function(trigger, callback, errorCallback) {
	if(!trigger.type) {
		trigger.type = "FUNCTION";
	}
	return callPOST(servicesConfig.services.triggers.url, trigger, callback, errorCallback);
};
sh.add.organization = function(organization, callback, errorCallback) {
	return callPOST(servicesConfig.services.organizations.url, organization, callback, errorCallback);
};
sh.add.data = function(opts, dataItem, callback, errorCallback) {
	var url = servicesConfig.services.thingData.url + "/" +
                      opts[THING_ID] + "/" +
                      opts[PROPERTY_NAME];
	return callPOST(url, dataItem, callback, errorCallback);
};

sh.add.streams = {};
sh.add.stream = function(stream, callback, errorCallback) {
	return callPOST(servicesConfig.services.streams.url, stream, callback, errorCallback);
};
sh.add.streams.source = function(source, callback, errorCallback) {
	return callPOST(servicesConfig.services.streamsources.url, source, callback, errorCallback);
};
sh.add.streams.sink = function(sink, callback, errorCallback) {
	return callPOST(servicesConfig.services.streamsinks.url, sink, callback, errorCallback);
};
sh.add.streams.processor = function(processor, callback, errorCallback) {
	return callPOST(servicesConfig.services.streamprocessors.url, processor, callback, errorCallback);
};


/* methods for PUTting data */

sh.save = {};

sh.save.me = function(me, callback, errorCallback) {
	return callPUT(servicesConfig.services.users.url + "/me", me, callback, errorCallback);
};
sh.save.thingType = function(thingType, callback, errorCallback) {
	return callPUT(servicesConfig.services.thingTypes.url, thingType, callback, errorCallback);
};
sh.save.app = function(app, callback, errorCallback) {
	return callPUT(servicesConfig.services.apps.url, app, callback, errorCallback);
};
sh.save.organization = function(organization, callback, errorCallback) {
	return callPUT(servicesConfig.services.organizations.url + "/" + organization.id, organization, callback, errorCallback);
};
sh.save.thing = function(thing, callback, errorCallback) {
	return callPUT(servicesConfig.services.things.url, thing, callback, errorCallback);
};
sh.save.simulationType = function(simType, callback, errorCallback) {
	return callPUT(servicesConfig.services.simulationTypes.url, simType, callback, errorCallback);
};
sh.save.trigger = function(trigger, callback, errorCallback) {
	return callPUT(servicesConfig.services.triggers.url, trigger, callback, errorCallback);
};

sh.save.streams = {};
sh.save.streams.source = function(stream, callback, errorCallback) {
	return callPUT(servicesConfig.services.streams.url + "/sources", stream, callback, errorCallback);
};
sh.save.sink = function(sink, callback, errorCallback) {
	return callPUT(servicesConfig.services.streamsinks.url, sink, callback, errorCallback);
};
sh.save.driver = function(driver, callback, errorCallback) {
	var url = servicesConfig.services.drivers.url + "/forThing/" +
                      driver[THING_ID] + "/" + driver[PROPERTY_NAME];
	return callPUT(url, driver, callback, errorCallback);
};
sh.save.config = function(config, callback, errorCallback) {
	var url = servicesConfig.services.users.url + "/by/email/" + authInfo.email + "/config";
	return callPUT(url, config, callback, errorCallback);
};
sh.save.access = function(access, callback, errorCallback) {
	var url = servicesConfig.services.access.url;
	if(access.id) {
		url += "/" + access.id;
		return callPUT(url, access, callback, errorCallback);
	} else if(access[SOURCE_ID]) {
		return callPOST(url, access, callback, errorCallback);
	} else {
		throw "Missing either '" + ID + "' or '" + SOURCE_ID + "' of stream access entity";
	}
};

/* methods for DELETEing data */

sh.delete = {};

sh.delete.thingType = function(thingType, callback, errorCallback) {
	var id = thingType.id ? thingType.id : thingType;
	return callDELETE(servicesConfig.services.thingTypes.url + "/" + id, callback, errorCallback);
};
sh.delete.app = function(app, callback, errorCallback) {
	var id = app.id ? app.id : app;
	return callDELETE(servicesConfig.services.apps.url + "/" + id, callback, errorCallback);
};
sh.delete.thing = function(thing, callback, errorCallback) {
	var id = thing.id ? thing.id : thing;
	return callDELETE(servicesConfig.services.things.url + "/" + id, callback, errorCallback);
};
sh.delete.simulationType = function(simType, callback, errorCallback) {
	var id = simType.id ? simType.id : simType;
	return callDELETE(servicesConfig.services.simulationTypes.url + "/" + id, callback, errorCallback);
};
sh.delete.simulation = function(id, callback, errorCallback) {
	return callDELETE(servicesConfig.services.simulations.url + "/" + id, callback, errorCallback);
};
sh.delete.trigger = function(trigger, callback, errorCallback) {
	var id = trigger.id ? trigger.id : trigger;
	return callDELETE(servicesConfig.services.triggers.url + "/" + id, callback, errorCallback);
};
sh.delete.triggersForCreator = function(creatorId, callback, errorCallback) {
	return callDELETE(servicesConfig.services.triggers.url + "?creatorId=" + creatorId, callback, errorCallback);
};
sh.delete.stream = function(stream, callback, errorCallback) {
	var id = stream.id ? stream.id : stream;
	return callDELETE(servicesConfig.services.streams.url + "/" + id, callback, errorCallback);
};
sh.delete.sink = function(sink, callback, errorCallback) {
	var id = sink.id ? sink.id : sink;
	return callDELETE(servicesConfig.services.streamsinks.url + "/" + id, callback, errorCallback);
};
sh.delete.driver = function(opts, callback, errorCallback) {
	var url = servicesConfig.services.drivers.url + "/resetFor/" +
			opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	return callGET(url, callback, errorCallback);
};


/* methods for accessing streams */

sh.stream.request = function(req, callback, errorCallback) {
	var id = req[STREAM_ID];
	if(!id) throw "Invalid stream id.";
	var url = servicesConfig.services.streams.url + "/" + id + "/permissions";
	return callPOST(url, req, callback, errorCallback);
};
sh.stream.permissions = function(stream, callback, errorCallback) {
	var id = stream.id ? stream.id : stream;
	var url = servicesConfig.services.streams.url + "/" + id + "/permissions";
	return callGET(url, callback, errorCallback);
};
sh.stream.permissions.save = function(perms, callback, errorCallback) {
	var url = servicesConfig.services.streams.url + "/" + perms[STREAM_ID] + "/permissions";
	return callPUT(url, perms, callback, errorCallback);
};
sh.stream.restrictions = function(stream, callback, errorCallback) {
	var id = stream.id ? stream.id : stream;
	var url = servicesConfig.services.streams.url + "/" + id + "/restrictions";
	return callGET(url, callback, errorCallback);
};
sh.stream.restrictions.save = function(restr, callback, errorCallback) {
	var url = servicesConfig.services.streams.url + "/" + restr[STREAM_ID] + "/restrictions";
	return callPUT(url, restr, callback, errorCallback);
};
sh.stream.apply = function(req, callback, errorCallback) {
	var id = req[STREAM_ID];
	if(!id) throw "Invalid stream id.";
	var url = servicesConfig.services.streams.url + "/" + id + "/apply";
	return callPOST(url, req, callback, errorCallback);
};


/* methods for simulation control */

sh.sim = {};
sh.sim.gen = function(request, callback, errorCallback) {
	var type = request.type == "GPS" ? "traffic" : "curve";
	var url = servicesConfig.services.simulations.url + "/gen/" + type;
	return callPOST(url, request, callback, errorCallback);
}

/* UTILITY METHODS */

function wrapDefaultErrorCallback(errorCallback) {
	return function(p1,p2,p3,p4,p5) {
		if(typeof errorCallback == "function") {
			var goOn = errorCallback(p1,p2,p3,p4,p5);
			if(goOn == false)
				return;
		}
		if(typeof sh.defaultErrorCallback == "function") {
			sh.defaultErrorCallback(p1,p2,p3,p4,p5);
		}
	}
}

var callGET = sh.callGET = function(url, options, errorCallback) {
	var m = mem();
	var callback = options.callback ? options.callback : options;
	if(options.doCacheResults && m[url]) {
		if(callback) {
			setTimeout(function(){
				callback(m[url]);
			}, 0);
		}
		return m[url];
	}
	var entry = m[url] = {};
	if(ttl > 0) {
		setTimeout(function(){
			delete m[url];
		}, ttl);
	}
	errorCallback = wrapDefaultErrorCallback(errorCallback);
	invokeGET(options, url,
		function(data, status, headers, config) {
			if(!data) {
				callback(data, status, headers, config);
				return;
			}
			if(typeof data.__result != "undefined") data = data.__result;
			if(Array.isArray(data)) {
				m[url] = data;
			} else if(typeof data == "object") {
				if(typeof $ != "undefined") {
					$.extend(entry, data);
				}
			} else {
				m[url] = data;
			}
			if(callback) {
				callback(data, status, headers, config);
			}
		}, errorCallback
	);
	return entry;
};

var callPOSTorPUT = function(invokeFunc, url, body, options, errorCallback) {
	if(typeof body == "object") {
		body = JSON.stringify(body);
	}
	var callback = options.callback ? options.callback : options;
	errorCallback = wrapDefaultErrorCallback(errorCallback);
	invokeFunc(options, url, body,
		function(data, status, headers, config) {
			if(callback) {
				if(typeof data.__result != "undefined") data = data.__result;
				callback(data, status, headers, config);
			}
		}, errorCallback
	);
};
var callPOST = sh.callPOST = function(url, body, callback, errorCallback) {
	return callPOSTorPUT(invokePOST, url, body, callback, errorCallback);
};
var callPUT = sh.callPUT = function(url, body, callback, errorCallback) {
	return callPOSTorPUT(invokePUT, url, body, callback, errorCallback);
};

var callDELETE = sh.callDELETE = function(url, callback, errorCallback) {
	return invokeDELETE(null, url,
		function(data, status, headers, config) {
			if(callback) {
				callback(data, status, headers, config);
			}
		}, errorCallback
	);
};

/* "shared memory", used as entity cache */

var mem = sh.mem = function() {
	var gl = typeof window == "undefined" ? global : window;
	if(gl.rootScope) {
		if(!gl.rootScope.shared) {
			gl.rootScope.shared = {};
		}
		return gl.rootScope;
	}
	if(!gl.sharedMem) {
		gl.sharedMem = {};
	}
	return gl.sharedMem;
};

/* WEBSOCKET FUNCTIONS */

var connectWebsocket = function(onOpenCallback) {
	assertAuth();
	var ws;
	if(openConnectionPerRequest || !sh.websocket || sh.websocket.readyState > 1) {
		var wsURL = servicesConfig.services.websocket.url;
		var authToken = window.authToken ? window.authToken : sh.authToken;

		if(authToken.network && authToken.access_token) {
			this.websocket = ws = new WebSocket(wsURL,
					authToken.network + "~" + authToken.access_token);
		} else if(authToken.userId && authToken.appKey) {
			this.websocket = ws = new WebSocket(wsURL,
					authToken.userId + "~" + authToken.appKey);
		} else {
			throw "Please provide RIOX_USER_ID and RIOX_APP_KEY variables.";
		}
	}

	if(onOpenCallback) {
		if(ws.readyState == 0) {
			ws.onopen = function() {
				onOpenCallback(ws);
			};
		} else {
			onOpenCallback(ws);
		}
	}

	return ws;
};

/* subscribe via websocket */
sh.subscribe = function(options, callback) {
	var ws = connectWebsocket(function(ws) {
		var msg = {
			type: "SUBSCRIBE",
			thingId: options.thingId,
			propertyName: options.propertyName
		};
		if(options.clientId) {
			msg.clientId = options.clientId;
		}
		ws.send(JSON.stringify(msg));
	});
	ws.onmessage = function(msg) {
		var data = JSON.parse(msg.data);
		if(callback) {
			result = callback(data);
			if(result === false) {
				// unsubscribe
				var msg = {
					type: "UNSUBSCRIBE",
					thingId: options.thingId,
					propertyName: options.propertyName
				};
				ws.send(JSON.stringify(msg));
			}
		}
	}
};

/* unsubscribe all via websocket */

sh.unsubscribeAll = function(callback) {
	connectWebsocket(function(ws) {
		var msg = {
			type: "UNSUBSCRIBE",
			unsubscribeAll: true
		};
		ws.send(JSON.stringify(msg));
		if(callback) {
			callback(ws);
		}
	});
};

/* HELPER METHODS */

/* http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

var clone = function(obj) {
	return JSON.parse(JSON.stringify(obj));
};

/* expose API */

if(typeof module != "undefined") {
	module.exports = sh;
} else if(typeof window != "undefined") {
	window.riots = sh;
	window.riox = sh;

	/* INIT METHODS (must go last) */
	if(window.RIOX_USER_ID && window.RIOX_APP_KEY) {
		sh.auth();
	};
}


return sh;
})();

/*
A JavaScript implementation of the SHA family of hashes, as
defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
as defined in FIPS PUB 198a
Copyright Brian Turek 2008-2015
Distributed under the BSD License
See http://caligatio.github.com/jsSHA/ for more information
Several functions taken from Paul Johnston
*/
'use strict';(function(F){function u(a,b,d){var c=0,f=[0],h="",g=null,h=d||"UTF8";if("UTF8"!==h&&"UTF16BE"!==h&&"UTF16LE"!==h)throw"encoding must be UTF8, UTF16BE, or UTF16LE";if("HEX"===b){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";g=w(a);c=g.binLen;f=g.value}else if("TEXT"===b)g=x(a,h),c=g.binLen,f=g.value;else if("B64"===b)g=y(a),c=g.binLen,f=g.value;else if("BYTES"===b)g=z(a),c=g.binLen,f=g.value;else throw"inputFormat must be HEX, TEXT, B64, or BYTES";this.getHash=
function(a,b,d,h){var g=null,e=f.slice(),k=c,l;3===arguments.length?"number"!==typeof d&&(h=d,d=1):2===arguments.length&&(d=1);if(d!==parseInt(d,10)||1>d)throw"numRounds must a integer >= 1";switch(b){case "HEX":g=A;break;case "B64":g=B;break;case "BYTES":g=C;break;default:throw"format must be HEX, B64, or BYTES";}if("SHA-224"===a)for(l=0;l<d;l+=1)e=t(e,k,a),k=224;else if("SHA-256"===a)for(l=0;l<d;l+=1)e=t(e,k,a),k=256;else throw"Chosen SHA variant is not supported";return g(e,D(h))};this.getHMAC=
function(a,b,d,g,s){var e,k,l,n,p=[],E=[];e=null;switch(g){case "HEX":g=A;break;case "B64":g=B;break;case "BYTES":g=C;break;default:throw"outputFormat must be HEX, B64, or BYTES";}if("SHA-224"===d)k=64,n=224;else if("SHA-256"===d)k=64,n=256;else throw"Chosen SHA variant is not supported";if("HEX"===b)e=w(a),l=e.binLen,e=e.value;else if("TEXT"===b)e=x(a,h),l=e.binLen,e=e.value;else if("B64"===b)e=y(a),l=e.binLen,e=e.value;else if("BYTES"===b)e=z(a),l=e.binLen,e=e.value;else throw"inputFormat must be HEX, TEXT, B64, or BYTES";
a=8*k;b=k/4-1;if(k<l/8){for(e=t(e,l,d);e.length<=b;)e.push(0);e[b]&=4294967040}else if(k>l/8){for(;e.length<=b;)e.push(0);e[b]&=4294967040}for(k=0;k<=b;k+=1)p[k]=e[k]^909522486,E[k]=e[k]^1549556828;d=t(E.concat(t(p.concat(f),a+c,d)),a+n,d);return g(d,D(s))}}function x(a,b){var d=[],c,f=[],h=0,g,m,q;if("UTF8"===b)for(g=0;g<a.length;g+=1)for(c=a.charCodeAt(g),f=[],128>c?f.push(c):2048>c?(f.push(192|c>>>6),f.push(128|c&63)):55296>c||57344<=c?f.push(224|c>>>12,128|c>>>6&63,128|c&63):(g+=1,c=65536+((c&
1023)<<10|a.charCodeAt(g)&1023),f.push(240|c>>>18,128|c>>>12&63,128|c>>>6&63,128|c&63)),m=0;m<f.length;m+=1){for(q=h>>>2;d.length<=q;)d.push(0);d[q]|=f[m]<<24-h%4*8;h+=1}else if("UTF16BE"===b||"UTF16LE"===b)for(g=0;g<a.length;g+=1){c=a.charCodeAt(g);"UTF16LE"===b&&(m=c&255,c=m<<8|c>>8);for(q=h>>>2;d.length<=q;)d.push(0);d[q]|=c<<16-h%4*8;h+=2}return{value:d,binLen:8*h}}function w(a){var b=[],d=a.length,c,f,h;if(0!==d%2)throw"String of HEX type must be in byte increments";for(c=0;c<d;c+=2){f=parseInt(a.substr(c,
2),16);if(isNaN(f))throw"String of HEX type contains invalid characters";for(h=c>>>3;b.length<=h;)b.push(0);b[c>>>3]|=f<<24-c%8*4}return{value:b,binLen:4*d}}function z(a){var b=[],d,c,f;for(c=0;c<a.length;c+=1)d=a.charCodeAt(c),f=c>>>2,b.length<=f&&b.push(0),b[f]|=d<<24-c%4*8;return{value:b,binLen:8*a.length}}function y(a){var b=[],d=0,c,f,h,g,m;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";f=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==f&&f<a.length)throw"Invalid '=' found in base-64 string";
for(f=0;f<a.length;f+=4){m=a.substr(f,4);for(h=g=0;h<m.length;h+=1)c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(m[h]),g|=c<<18-6*h;for(h=0;h<m.length-1;h+=1){for(c=d>>>2;b.length<=c;)b.push(0);b[c]|=(g>>>16-8*h&255)<<24-d%4*8;d+=1}}return{value:b,binLen:8*d}}function A(a,b){var d="",c=4*a.length,f,h;for(f=0;f<c;f+=1)h=a[f>>>2]>>>8*(3-f%4),d+="0123456789abcdef".charAt(h>>>4&15)+"0123456789abcdef".charAt(h&15);return b.outputUpper?d.toUpperCase():d}function B(a,b){var d=
"",c=4*a.length,f,h,g;for(f=0;f<c;f+=3)for(g=f+1>>>2,h=a.length<=g?0:a[g],g=f+2>>>2,g=a.length<=g?0:a[g],g=(a[f>>>2]>>>8*(3-f%4)&255)<<16|(h>>>8*(3-(f+1)%4)&255)<<8|g>>>8*(3-(f+2)%4)&255,h=0;4>h;h+=1)d=8*f+6*h<=32*a.length?d+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(g>>>6*(3-h)&63):d+b.b64Pad;return d}function C(a){var b="",d=4*a.length,c,f;for(c=0;c<d;c+=1)f=a[c>>>2]>>>8*(3-c%4)&255,b+=String.fromCharCode(f);return b}function D(a){var b={outputUpper:!1,b64Pad:"="};
try{a.hasOwnProperty("outputUpper")&&(b.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(b.b64Pad=a.b64Pad)}catch(d){}if("boolean"!==typeof b.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof b.b64Pad)throw"Invalid b64Pad formatting option";return b}function p(a,b){return a>>>b|a<<32-b}function I(a,b,d){return a&b^~a&d}function J(a,b,d){return a&b^a&d^b&d}function K(a){return p(a,2)^p(a,13)^p(a,22)}function L(a){return p(a,6)^p(a,11)^p(a,25)}function M(a){return p(a,
7)^p(a,18)^a>>>3}function N(a){return p(a,17)^p(a,19)^a>>>10}function O(a,b){var d=(a&65535)+(b&65535);return((a>>>16)+(b>>>16)+(d>>>16)&65535)<<16|d&65535}function P(a,b,d,c){var f=(a&65535)+(b&65535)+(d&65535)+(c&65535);return((a>>>16)+(b>>>16)+(d>>>16)+(c>>>16)+(f>>>16)&65535)<<16|f&65535}function Q(a,b,d,c,f){var h=(a&65535)+(b&65535)+(d&65535)+(c&65535)+(f&65535);return((a>>>16)+(b>>>16)+(d>>>16)+(c>>>16)+(f>>>16)+(h>>>16)&65535)<<16|h&65535}function t(a,b,d){var c,f,h,g,m,q,p,t,s,e,k,l,n,u,
E,r,w,x,y,z,A,B,C,D,G,v=[],H,F=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,
3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];e=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];f=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];if("SHA-224"===d||"SHA-256"===d)k=64,c=(b+65>>>9<<4)+15,u=16,E=1,G=Number,r=O,w=P,x=Q,y=M,z=N,A=K,B=L,D=J,
C=I,e="SHA-224"===d?e:f;else throw"Unexpected error in SHA-2 implementation";for(;a.length<=c;)a.push(0);a[b>>>5]|=128<<24-b%32;a[c]=b;H=a.length;for(l=0;l<H;l+=u){b=e[0];c=e[1];f=e[2];h=e[3];g=e[4];m=e[5];q=e[6];p=e[7];for(n=0;n<k;n+=1)16>n?(s=n*E+l,t=a.length<=s?0:a[s],s=a.length<=s+1?0:a[s+1],v[n]=new G(t,s)):v[n]=w(z(v[n-2]),v[n-7],y(v[n-15]),v[n-16]),t=x(p,B(g),C(g,m,q),F[n],v[n]),s=r(A(b),D(b,c,f)),p=q,q=m,m=g,g=r(h,t),h=f,f=c,c=b,b=r(t,s);e[0]=r(b,e[0]);e[1]=r(c,e[1]);e[2]=r(f,e[2]);e[3]=r(h,
e[3]);e[4]=r(g,e[4]);e[5]=r(m,e[5]);e[6]=r(q,e[6]);e[7]=r(p,e[7])}if("SHA-224"===d)a=[e[0],e[1],e[2],e[3],e[4],e[5],e[6]];else if("SHA-256"===d)a=e;else throw"Unexpected error in SHA-2 implementation";return a}F.jsSHA=u})(this);
