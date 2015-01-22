/** 
 * @author whummer
 */

/* define array index names for model properties */
var NAME = "name";
var CREATION_DATE = "creation-date";
var THING_TYPE = "thing-type";
var THING_ID = "thing-id";
var THINGS = "things";
var PROPERTIES = "properties";
var PROPERTY_ID = "property-id";
var PROPERTY_NAME = "property";
var PROPERTY_VALUE = "value";
var PROPERTY_TYPE = "data-type";
var TIMESTAMP = "timestamp";
var IMAGE_DATA = "image-data";
var SIMULATION_ID = "simulation-id";
var START_TIME = "start-time";
var END_TIME = "end-time";
var USER_ID = "user-id";

(function() {

/* CONFIGURATIONS */

/**
 * openConnectionPerRequest
 *  	if true, open a websocket connection for each subscription,
 *  	if false, re-use a single websocket connection (TODO implement)
 */
var openConnectionPerRequest = true;

/* END OF CONFIGURATIONS */

var sh = {};
var ttl = 15000;

/* initialize authInfo */
sh.auth = function(options, callback, errorCallback) {
	sh.authInfo = {};
	sh.authInfo.userId = (options && options.RIOTS_USER_ID) ? options.RIOTS_USER_ID : window.RIOTS_USER_ID;
	sh.authInfo.appKey = (options && options.RIOTS_APP_KEY) ? options.RIOTS_APP_KEY : window.RIOTS_APP_KEY;
	assertAuth();
	var __defaultHeaders = {
		"Content-Type": "application/json",
		"riots-auth-user-id": window.RIOTS_USER_ID,
		"riots-auth-app-key": window.RIOTS_APP_KEY
	}
	$.ajaxSetup({
	    headers: __defaultHeaders
	});
	sh.me(function(result) {
		console.log("Authentication successful.", result);
		if(callback) {
			callback(result);
		}
	}, function(result) {
		console.log("Authentication error.");
		if(errorCallback) {
			errorCallback(result);
		}
	});
}
var assertAuth = function() {
	if(!sh.authInfo || !sh.authInfo.userId || !sh.authInfo.appKey) {
		throw "Please provide valid authentication information using RIOTS_USER_ID and RIOTS_APP_KEY global variables.";
	}
}

/* methods for GETting data */

sh.get = {};

sh.app = sh.get.app = function(id, callback, doCacheResults) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(appConfig.services.apps.url + "/" + id, callback, doCacheResults);
}
sh.me = function(callback, errorCallback) {
	return callGET(appConfig.services.users.url + "/me", callback, false, errorCallback);
}
sh.users = sh.get.users = function(callback) {
	return callGET(appConfig.services.users.url, callback);
}
sh.actions = sh.get.actions = function(opts, callback) {
	return callPOST(appConfig.services.users.url + "/actions/query", opts, callback);
}
sh.apps = sh.get.apps = function(callback, doCacheResults) {
	return callGET(appConfig.services.apps.url, callback, doCacheResults);
}
sh.thingType = sh.get.thingType = function(id, callback, doCacheResults) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(appConfig.services.thingTypes.url + "/" + id, callback, doCacheResults);
}
sh.thingTypes = sh.get.thingTypes = function(callback, doCacheResults) {
	var maxThings = 100;
	return callGET(appConfig.services.thingTypes.url + "?page=0&size=" + maxThings, callback, doCacheResults);
}
sh.things = sh.get.things = function(opts, callback, doCacheResults) {
	if(!opts) opts = {};
	var maxResults = opts.maxResults ? opts.maxResults : 100;
	var suffix = "?page=0&size=" + maxResults;
	if(opts.appId) {
		suffix = "/by/application/" + opts.appId;
	}
	return callGET(appConfig.services.things.url + suffix, callback, doCacheResults);
}
sh.thing = sh.get.thing = function(id, callback, doCacheResults) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(appConfig.services.things.url + "/" + id, callback, doCacheResults);
}
sh.triggers = sh.get.triggers = function(callback, doCacheResults) {
	return callGET(appConfig.services.triggers.url, callback, doCacheResults);
}
sh.manufacturers = sh.get.manufacturers = function(callback, doCacheResults) {
	return callGET(appConfig.services.manufacturers.url, callback, doCacheResults);
}
sh.stats = sh.get.stats = function(opts, callback) {
	var url = appConfig.services.stats.url;
	if(opts.type) url += "/" + opts.type;
	url += "?";
	if(opts.from) url += "&from=" + opts.from;
	if(opts.to) url += "&to=" + opts.to;
	if(opts.period) url += "&period=" + opts.period;
	return callGET(url, callback);
}
sh.simulationTypes = sh.get.simulationTypes = function(callback, doCacheResults) {
	var maxResults = 100;
	return callGET(appConfig.services.simulationTypes.url + "?page=0&size=" + maxResults, callback, doCacheResults);
}
sh.data = sh.get.data = function(opts, callback, errorCallback) {
	var url = appConfig.services.thingData.url + "/" +
                      opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	if(opts.amount) {
		url += "/history?amount=" + opts.amount;
	}
	return callGET(url, callback, false, errorCallback);
}
sh.config = sh.get.config = function(callback) {
	var url = appConfig.services.users.url + "/by/email/" + authInfo.email + "/config";
	return callGET(url, callback);
}
sh.driver = sh.get.driver = function(opts, callback) {
	var url = appConfig.services.drivers.url + "/forThing/" +
                      opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	return callGET(url, callback);
}
sh.plans = sh.get.plans = function(callback) {
	var url = appConfig.services.billing.url + "/plans";
	return callGET(url, callback);
}
sh.usage = sh.get.usage = function(callback, errorCallback) {
	var url = appConfig.services.users.url + "/me/usage";
	return callGET(url, callback, false, errorCallback);
}
sh.properties = sh.get.properties = function(thingType, callback, doCacheResults) {
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
}


/* methods for POSTing data */

sh.add = {};

sh.add.thingType = function(thingType, callback) {
	return callPOST(appConfig.services.thingTypes.url, thingType, callback);
}
sh.add.app = function(app, callback) {
	return callPOST(appConfig.services.apps.url, app, callback);
}
sh.add.thing = function(thing, callback) {
	return callPOST(appConfig.services.things.url, thing, callback);
}
sh.add.simulationType = function(simType, callback) {
	return callPOST(appConfig.services.simulationTypes.url, simType, callback);
}
sh.add.trigger = function(trigger, callback) {
	return callPOST(appConfig.services.triggers.url, trigger, callback);
}
sh.add.data = function(opts, dataItem, callback, errorCallback) {
	var url = appConfig.services.thingData.url + "/" +
                      opts[THING_ID] + "/" + 
                      opts[PROPERTY_NAME];
	return callPOST(url, dataItem, callback, errorCallback);
}

/* methods for PUTting data */

sh.save = {};

sh.save.me = function(me, callback) {
	return callPUT(appConfig.services.users.url + "/me", me, callback);
}
sh.save.thingType = function(thingType, callback) {
	return callPUT(appConfig.services.thingTypes.url, thingType, callback);
}
sh.save.app = function(app, callback) {
	return callPUT(appConfig.services.apps.url, app, callback);
}
sh.save.thing = function(thing, callback) {
	return callPUT(appConfig.services.things.url, thing, callback);
}
sh.save.simulationType = function(simType, callback) {
	return callPUT(appConfig.services.simulationTypes.url, simType, callback);
}
sh.save.trigger = function(trigger, callback) {
	return callPUT(appConfig.services.triggers.url, trigger, callback);
}
sh.save.driver = function(driver, callback) {
	var url = appConfig.services.drivers.url + "/forThing/" +
                      driver[THING_ID] + "/" + driver[PROPERTY_NAME];
	return callPUT(url, driver, callback);
}
sh.save.config = function(config, callback) {
	var url = appConfig.services.users.url + "/by/email/" + authInfo.email + "/config";
	return callPUT(url, config, callback);
}

/* methods for DELETEing data */

sh.delete = {};

sh.delete.thingType = function(thingType, callback) {
	var id = thingType.id ? thingType.id : thingType;
	return callDELETE(appConfig.services.thingTypes.url + "/" + id, callback);
}
sh.delete.app = function(app, callback) {
	var id = app.id ? app.id : app;
	return callDELETE(appConfig.services.apps.url + "/" + id, callback);
}
sh.delete.thing = function(thing, callback) {
	var id = thing.id ? thing.id : thing;
	return callDELETE(appConfig.services.things.url + "/" + id, callback);
}
sh.delete.simulationType = function(simType, callback) {
	var id = simType.id ? simType.id : simType;
	return callDELETE(appConfig.services.simulationTypes.url + "/" + id, callback);
}
sh.delete.trigger = function(trigger, callback) {
	var id = trigger.id ? trigger.id : trigger;
	return callDELETE(appConfig.services.triggers.url + "/" + id, callback);
}

/* methods for simulation control */

sh.sim = {};
sh.sim.gen = function(request, callback) {
	var type = request.type == "GPS" ? "traffic" : "curve";
	var url = appConfig.services.simulations.url + "/gen/" + type;
	return callPOST(url, request, callback);
}

/* UTILITY METHODS */

var callGET = sh.callGET = function(url, callback, doCacheResults, errorCallback) {
	var m = mem();
	if(doCacheResults && m[url]) {
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
	invokeGET(null, url,
		function(data, status, headers, config) {
			//console.log("data.result", typeof data.result, data.result, Array.isArray(data.result), url);
			if(Array.isArray(data.result)) {
				m[url] = data.result;
			} else if(typeof data.result == "object") {
				$.extend(entry, data.result);
			} else {
				m[url] = data.result;
			}
			if(callback) {
				callback(data.result);
			}
		}, errorCallback
	);
	return entry;
}

var callPOSTorPUT = function(invokeFunc, url, body, callback, errorCallback) {
	if(typeof body == "object") {
		body = JSON.stringify(body);
	}
	invokeFunc(null, url, body,
		function(data, status, headers, config) {
			if(callback) {
				callback(data.result);
			}
		}, errorCallback
	);
}
var callPOST = sh.callPOST = function(url, body, callback, errorCallback) {
	return callPOSTorPUT(invokePOST, url, body, callback, errorCallback);
}
var callPUT = sh.callPUT = function(url, body, callback, errorCallback) {
	return callPOSTorPUT(invokePUT, url, body, callback, errorCallback);
}

var callDELETE = sh.callDELETE = function(url, callback) {
	invokeDELETE(null, url,
		function(data, status, headers, config) {
			if(callback) {
				callback(data, status, headers, config);
			}
		}
	);
}

/* "shared memory", used as entity cache */

var mem = sh.mem = function() {
	if(window.rootScope) {
		if(!window.rootScope.shared) {
			window.rootScope.shared = {};
		}
		return window.rootScope;
	}
	if(!window.sharedMem) {
		window.sharedMem = {};
	}
	return window.sharedMem;
}

/* WEBSOCKET FUNCTIONS */

var connectWebsocket = function(onOpenCallback) {
	assertAuth();
	var ws;
	if(openConnectionPerRequest || !sh.websocket || sh.websocket.readyState > 1) {
		var wsURL = appConfig.services.websocket.url;
		var authInfo = window.authInfo ? window.authInfo : sh.authInfo;

		if(authInfo.network && authInfo.access_token) {
			this.websocket = ws = new WebSocket(wsURL, 
				authInfo.network + "~" + authInfo.access_token);
		} else if(authInfo.userId && authInfo.appKey) {
			this.websocket = ws = new WebSocket(wsURL, 
				authInfo.userId + "~" + authInfo.appKey);
		} else {
			throw "Please provide RIOTS_USER_ID and RIOTS_APP_KEY variables.";
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
}

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
		console.log("subscribing", msg.thingId, msg.propertyName);
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
}

/* unsubscribe all via websocket */

sh.unsubscribeAll = function(callback) {
	connectWebsocket(function(ws) {
		console.log("unsubscribeAll");
		var msg = {
			type: "UNSUBSCRIBE",
			unsubscribeAll: true
		};
		ws.send(JSON.stringify(msg));
		if(callback) {
			callback(ws);
		}
	});
}


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

/* INIT METHODS */

if(window.RIOTS_USER_ID && window.RIOTS_APP_KEY) {
	sh.auth();
}

/* expose API */
window.riots = sh;
return sh;
})();