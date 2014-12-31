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

(function() {

var sh = {};
var ttl = 20000;

if(window.rootScope && window.rootScope.shared) {
	sh = window.rootScope.shared;
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
			callback(m[url]);
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


/* subscribe via websocket */
sh.subscribe = function(options, callback) {
	var wsURL = appConfig.services.websocket.url;
	var ws = this.websocket = new WebSocket(wsURL, 
		authInfo.network + "~" + authInfo.access_token);
	ws.onopen = function() {
		var msg = {
			type: "SUBSCRIBE",
			thingId: options.thingId,
			propertyName: options.propertyName
		};
		msg = JSON.stringify(msg);
		ws.send(msg);
	}
	ws.onmessage = function(msg) {
		var data = JSON.parse(msg.data);
		if(callback) {
			callback(data);
		}
	}
}


window.shared = sh;
window.model = sh;
window.riots = sh;

return sh;
})();