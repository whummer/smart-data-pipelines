/** 
 * @author whummer
 */

/* define array index names for model properties */
var NAME = "name";
var CREATION_DATE = "creation-date";
var CREATOR_ID = "creator-id";
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

/* initialize authentication info */
sh.login = function(options, callback, errorCallback) {
	var shaObj = new jsSHA(options.password, "TEXT");
	options.password = shaObj.getHash("SHA-256", "HEX");
	callPOST(appConfig.services.users.url + "/login", options, callback, errorCallback);
};
var assertAuth = function() {
	var ok = sh.authToken &&
			((sh.authToken.userId && sh.authToken.appKey) ||
			(sh.authToken.network && sh.authToken.access_token));
	if(!ok) {
		console.log(sh.authToken);
		console.trace();
		throw "Please provide valid authentication information using RIOTS_USER_ID and RIOTS_APP_KEY global variables.";
	}
};

/* register/authenticate user */

sh.activate = function(actKey, callback, errorCallback) {
	var req = {activationKey: actKey};
	return riots.callPOST(appConfig.services.users.url + "/activate", req, callback, errorCallback);
};
sh.signup = function(userInfo, callback, errorCallback) {
	return riots.callPOST(appConfig.services.users.url + "/signup", userInfo, callback, errorCallback);
};
sh.auth = function(options, callback, errorCallback) {
	var authToken = sh.authToken = {};
	authToken.userId = (options && options.RIOTS_USER_ID) ? options.RIOTS_USER_ID : window.RIOTS_USER_ID;
	authToken.appKey = (options && options.RIOTS_APP_KEY) ? options.RIOTS_APP_KEY : window.RIOTS_APP_KEY;
	authToken.network = (options && options.RIOTS_AUTH_NETWORK) ? options.RIOTS_AUTH_NETWORK : window.RIOTS_AUTH_NETWORK;
	authToken.access_token = (options && options.RIOTS_AUTH_TOKEN) ? options.RIOTS_AUTH_TOKEN : window.RIOTS_AUTH_TOKEN;
	console.log(sh.authToken);
	assertAuth();
	var __defaultHeaders = {
		"Content-Type": "application/json",
		"riots-auth-user-id": authToken.userId,
		"riots-auth-app-key": authToken.appKey,
		"riots-auth-network": authToken.network,
		"riots-auth-token": authToken.access_token
	}
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
		callPOST(appConfig.services.users.url + "/auth", authToken, funcSuccess, funcError);
	}
};

/* methods for GETting data */

sh.get = {};

sh.app = sh.get.app = function(opts, callback, doCacheResults) {
	if(!opts) {
		if(callback) callback(null);
		return null;
	}
	var path = "/" + opts;
	if(opts.appKey) {
		path = "/by/appKey/" + opts.appKey;
	}
	return callGET(appConfig.services.apps.url + path, callback, doCacheResults);
};
sh.me = function(callback, errorCallback) {
	return callGET(appConfig.services.users.url + "/me", callback, false, errorCallback);
};
sh.users = sh.get.users = function(callback) {
	return callGET(appConfig.services.users.url, callback);
};
sh.actions = sh.get.actions = function(opts, callback) {
	return callPOST(appConfig.services.users.url + "/actions/query", opts, callback);
};
sh.apps = sh.get.apps = function(callback, doCacheResults) {
	return callGET(appConfig.services.apps.url, callback, doCacheResults);
};
sh.thingType = sh.get.thingType = function(id, callback, doCacheResults) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(appConfig.services.thingTypes.url + "/" + id, callback, doCacheResults);
};
sh.thingTypes = sh.get.thingTypes = function(callback, doCacheResults) {
	var maxThings = 100;
	return callGET(appConfig.services.thingTypes.url + "?page=0&size=" + maxThings, callback, doCacheResults);
};
sh.things = sh.get.things = function(opts, callback, doCacheResults) {
	if(!opts) opts = {};
	var maxResults = opts.maxResults ? opts.maxResults : 100;
	var suffix = "?page=0&size=" + maxResults;
	if(opts.appId) {
		suffix = "/by/application/" + opts.appId;
	}
	return callGET(appConfig.services.things.url + suffix, callback, doCacheResults);
};
sh.thing = sh.get.thing = function(id, callback, doCacheResults) {
	if(!id) {
		if(callback) callback(null);
		return null;
	}
	return callGET(appConfig.services.things.url + "/" + id, callback, doCacheResults);
};
sh.triggers = sh.get.triggers = function(callback, doCacheResults) {
	return callGET(appConfig.services.triggers.url, callback, doCacheResults);
};
sh.streams = sh.get.streams = function(searchOpts, callback) {
	var url = buildQueryURL(appConfig.services.streams.url, searchOpts);
	return callGET(url, callback);
};
sh.manufacturers = sh.get.manufacturers = function(callback, doCacheResults) {
	return callGET(appConfig.services.manufacturers.url, callback, doCacheResults);
};
sh.stats = sh.get.stats = function(opts, callback) {
	var url = buildQueryURL(appConfig.services.stats.url, opts);
	return callGET(url, callback);
};
sh.simulationTypes = sh.get.simulationTypes = function(callback, doCacheResults) {
	var maxResults = 100;
	return callGET(appConfig.services.simulationTypes.url + "?page=0&size=" + maxResults, callback, doCacheResults);
};
sh.data = sh.get.data = function(opts, callback, errorCallback) {
	var url = appConfig.services.thingData.url + "/" +
                      opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	if(opts.amount) {
		url += "/history?amount=" + opts.amount;
	}
	return callGET(url, callback, false, errorCallback);
};
sh.config = sh.get.config = function(callback) {
	assertAuth();
	var url = appConfig.services.users.url + "/by/email/" + authInfo.email + "/config";
	return callGET(url, callback);
};
sh.driver = sh.get.driver = function(opts, callback) {
	var url = appConfig.services.drivers.url + "/forThing/" +
                      opts[THING_ID] + "/" + opts[PROPERTY_NAME];
	return callGET(url, callback);
};
sh.plans = sh.get.plans = function(callback) {
	var url = appConfig.services.billing.url + "/plans";
	return callGET(url, callback);
};
sh.organizations = sh.get.organizations = function(callback) {
	var url = appConfig.services.organizations.url;
	return callGET(url, callback);
};
sh.usage = sh.get.usage = function(callback, errorCallback) {
	var url = appConfig.services.users.url + "/me/usage";
	return callGET(url, callback, false, errorCallback);
};
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
}

/* methods for POSTing data */

sh.add = {};

sh.add.thingType = function(thingType, callback) {
	return callPOST(appConfig.services.thingTypes.url, thingType, callback);
};
sh.add.app = function(app, callback) {
	return callPOST(appConfig.services.apps.url, app, callback);
};
sh.add.thing = function(thing, callback) {
	return callPOST(appConfig.services.things.url, thing, callback);
};
sh.add.simulationType = function(simType, callback) {
	return callPOST(appConfig.services.simulationTypes.url, simType, callback);
};
sh.add.trigger = function(trigger, callback) {
	if(!trigger.type) {
		trigger.type = "FUNCTION";
	}
	return callPOST(appConfig.services.triggers.url, trigger, callback);
};
sh.add.stream = function(stream, callback) {
	return callPOST(appConfig.services.streams.url, stream, callback);
};
sh.add.data = function(opts, dataItem, callback, errorCallback) {
	var url = appConfig.services.thingData.url + "/" +
                      opts[THING_ID] + "/" + 
                      opts[PROPERTY_NAME];
	return callPOST(url, dataItem, callback, errorCallback);
};

/* methods for PUTting data */

sh.save = {};

sh.save.me = function(me, callback) {
	return callPUT(appConfig.services.users.url + "/me", me, callback);
};
sh.save.thingType = function(thingType, callback) {
	return callPUT(appConfig.services.thingTypes.url, thingType, callback);
};
sh.save.app = function(app, callback) {
	return callPUT(appConfig.services.apps.url, app, callback);
};
sh.save.organization = function(organization, callback) {
	return callPUT(appConfig.services.organizations.url, organization, callback);
};
sh.save.thing = function(thing, callback) {
	return callPUT(appConfig.services.things.url, thing, callback);
};
sh.save.simulationType = function(simType, callback) {
	return callPUT(appConfig.services.simulationTypes.url, simType, callback);
};
sh.save.trigger = function(trigger, callback) {
	return callPUT(appConfig.services.triggers.url, trigger, callback);
};
sh.save.stream = function(stream, callback) {
	return callPUT(appConfig.services.streams.url, stream, callback);
};
sh.save.driver = function(driver, callback) {
	var url = appConfig.services.drivers.url + "/forThing/" +
                      driver[THING_ID] + "/" + driver[PROPERTY_NAME];
	return callPUT(url, driver, callback);
};
sh.save.config = function(config, callback) {
	var url = appConfig.services.users.url + "/by/email/" + authInfo.email + "/config";
	return callPUT(url, config, callback);
};

/* methods for DELETEing data */

sh.delete = {};

sh.delete.thingType = function(thingType, callback) {
	var id = thingType.id ? thingType.id : thingType;
	return callDELETE(appConfig.services.thingTypes.url + "/" + id, callback);
};
sh.delete.app = function(app, callback) {
	var id = app.id ? app.id : app;
	return callDELETE(appConfig.services.apps.url + "/" + id, callback);
};
sh.delete.thing = function(thing, callback) {
	var id = thing.id ? thing.id : thing;
	return callDELETE(appConfig.services.things.url + "/" + id, callback);
};
sh.delete.simulationType = function(simType, callback) {
	var id = simType.id ? simType.id : simType;
	return callDELETE(appConfig.services.simulationTypes.url + "/" + id, callback);
};
sh.delete.trigger = function(trigger, callback) {
	var id = trigger.id ? trigger.id : trigger;
	return callDELETE(appConfig.services.triggers.url + "/" + id, callback);
};
sh.delete.triggersForCreator = function(creatorId, callback) {
	return callDELETE(appConfig.services.triggers.url + "?creatorId=" + creatorId, callback);
};
sh.delete.stream = function(stream, callback) {
	var id = stream.id ? stream.id : stream;
	return callDELETE(appConfig.services.streams.url + "/" + id, callback);
};


/* methods for accessing streams */
sh.stream = {};

sh.stream.request = function(stream, callback) {
	var id = stream.id ? stream.id : stream;
	return callPOST(appConfig.services.streams.url + "/" + id + "/permissions", callback);
};

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
			if(!data) {
				callback(data);
				return;
			}
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
};

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
};
var callPOST = sh.callPOST = function(url, body, callback, errorCallback) {
	return callPOSTorPUT(invokePOST, url, body, callback, errorCallback);
};
var callPUT = sh.callPUT = function(url, body, callback, errorCallback) {
	return callPOSTorPUT(invokePUT, url, body, callback, errorCallback);
};

var callDELETE = sh.callDELETE = function(url, callback) {
	return invokeDELETE(null, url,
		function(data, status, headers, config) {
			if(callback) {
				callback(data, status, headers, config);
			}
		}
	);
};

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
};

/* WEBSOCKET FUNCTIONS */

var connectWebsocket = function(onOpenCallback) {
	assertAuth();
	var ws;
	if(openConnectionPerRequest || !sh.websocket || sh.websocket.readyState > 1) {
		var wsURL = appConfig.services.websocket.url;
		var authToken = window.authToken ? window.authToken : sh.authToken;

		if(authToken.network && authToken.access_token) {
			this.websocket = ws = new WebSocket(wsURL, 
					authToken.network + "~" + authToken.access_token);
		} else if(authToken.userId && authToken.appKey) {
			this.websocket = ws = new WebSocket(wsURL, 
					authToken.userId + "~" + authToken.appKey);
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
};

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

/* expose API */
window.riots = sh;


/* INIT METHODS (must go last) */
if(window.RIOTS_USER_ID && window.RIOTS_APP_KEY) {
	sh.auth();
};

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
