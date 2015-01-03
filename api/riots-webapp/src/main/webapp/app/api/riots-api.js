/** 
 * @author whummer
 */

/* define array index names for model properties */
var THING_TYPE = "thing-type";
var THING_ID = "thing-id";
var PROPERTIES = "properties";
var PROPERTY_ID = "property-id";
var PROPERTY_NAME = "property";
var PROPERTY_VALUE = "value";
var TIMESTAMP = "timestamp";
var IMAGE_URLS = "image-urls";

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
var ttl = 20000;

/* initialize authInfo */
sh.authInfo = {};

if(window.RIOTS_USER_ID) {
	sh.authInfo.userId = window.RIOTS_USER_ID;
}
if(window.RIOTS_APP_ID) {
	sh.authInfo.appId = window.RIOTS_APP_ID;
}

sh.thingType = function(id, callback) {
	return object(appConfig.services.thingTypes.url + "/" + id, callback);
}
sh.thingTypes = function(callback) {
	var maxThings = 100;
	return object(appConfig.services.thingTypes.url + "?page=0&size=" + maxThings, callback);
}
sh.things = function(callback) {
	var maxThings = 100;
	return object(appConfig.services.things.url + "?page=0&size=" + maxThings, callback);
}
sh.properties = function(thingType, callback) {
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
	callback(thingType.properties);
	/* recurse into sub-properties */
	if(thingType.properties) {
		var recurseProps = function(prop, callback, propNamePrefix) {
			if(prop.children) {
				$.each(prop.children, function(idx,subProp) {
					subProp = clone(subProp);
					subProp.name = propNamePrefix + subProp.name;
					callback([subProp]);
					recurseProps(subProp, callback, subProp.name + ".");
				});
			}
		}
		$.each(thingType.properties, function(idx,prop) {
			recurseProps(prop, callback, prop.name + ".");
		});
	}
}

var object = function(url, callback) {
	var m = mem();
	if(m[url]) {
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

			//console.log("callback", data.result);
			if(callback) {
				callback(data.result);
			}
		}
	);
	return entry;
}

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

var connectWebsocket = function(onOpenCallback) {
	var ws;
	if(openConnectionPerRequest || !sh.websocket || sh.websocket.readyState > 1) {
		var wsURL = appConfig.services.websocket.url;
		var authInfo = sh.authInfo;
	
		if(authInfo.network && authInfo.access_token) {
			this.websocket = ws = new WebSocket(wsURL, 
				authInfo.network + "~" + authInfo.access_token);
		} else if(authInfo.userId && authInfo.appId) {
			this.websocket = ws = new WebSocket(wsURL, 
				authInfo.userId + "~" + authInfo.appId);
		} else {
			throw "Please provide RIOTS_USER_ID and RIOTS_APP_ID variables.";
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
		console.log("subscribing", options);
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

/* UTIL METHODS */

sh.util = {}

sh.util.addGeoFence = function(config, callback) {
	var url = appConfig.services.utils.url + "/geo/fence";
	invokePOST(null, url, JSON.stringify(config),
	function(data, status, headers, config) {
		if(callback) {
			callback(data.result);
		}
	});
}
sh.util.removeGeoFence = function(id, callback) {
	var url = appConfig.services.utils.url + "/geo/fence/" + id;
	invokeDELETE(null, url,
	function(data, status, headers, config) {
		if(callback) {
			callback(data.result);
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

/* expose API */

window.shared = sh;
window.model = sh;
window.riots = sh;

return sh;
})();