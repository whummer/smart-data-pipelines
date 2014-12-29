/** 
 * @author whummer
 */

/* define array index names for model properties */
var THING_TYPE = "thing-type";
var THING_ID = "thing-id";
var PROPERTIES = "properties";
var PROPERTY_ID = "property-id";
var PROPERTY_NAME = "property";

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
	//console.log("thingType.children", thingType.children);
	if(thingType.children) {
		$.each(thingType.children, function(idx,el) {
			sh.properties(el, callback);
		});
	}
	callback(thingType.properties);
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

window.shared = sh;
window.model = sh;

return sh;
})();