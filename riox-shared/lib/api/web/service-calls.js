/** 
 * @author whummer
 */

(function() {

var sh = {};

var prettifyCSSLoaded = false;
var __alertServiceError = function(config, status) {
	if(!window.showErrorDialog || !config) {
		return;
	}
	var bodyData = config.data ? JSON.stringify(JSON.parse(config.data), undefined, 2) : "";
	var bodyDataString = config.data ? JSON.stringify(config.data) : "";
	var message = "Cannot perform service call.";
	var details = "<table>" +
		"<tr><td><b>Status:</b></td><td>" + status + "</td></tr>" + 
		"<tr><td><b>URL:</b></td><td>" + config.url + "</td></tr>" +
		"<tr><td><b>Method:</b></td><td>" + config.method + "</td></tr>" +
		"<tr><td style=\"vertical-align: top;\"><b>Headers:</b></td><td>" + 
			JSON.stringify(config.headers) + "</td></tr>" + 
		"<tr><td style=\"vertical-align: top;\"><b>Body:</b></td><td>" +
		"<pre class=\"prettyprint\"><code class=\"language-js\">" + 
			bodyData + 
		"</code></pre></td></tr>" +
		"<tr><td><b>Body (as string):</b></td><td>" + 
			"<pre class=\"prettyprint\" style=\"max-width: 800; overflow: auto;\"><code class=\"language-js\">" + 
			bodyDataString +
		"</code></pre></td></tr>" +
		"</table>";
	if(status == 403) {
		// HTTP 403 FORBIDDEN
		message = "<p><b>Access denied - You do not have the permission to perform this operation.</b></p>" +
			"<p>Note: Certain operations are restricted, e.g., " +
			"you cannot delete objects created by other users.</p>";
		details = "";
	}
	if(status == 404) {
		// HTTP 404 NOT FOUND
		message = "<p><b>The specified resource does not exist:</b></p>" +
			"<p>" + config.url + ".</p>";
		details = "";
	}
	showErrorDialog(message, details,
		function() {
			require([
			    "prettify"
			], function(prettify){
				if(!prettifyCSSLoaded) {
					// TODO: prettify.js currently does not load its CSS file..
					var link = document.createElement('link');
					link.setAttribute('rel', 'stylesheet');
					link.setAttribute('type', 'text/css');
					link.setAttribute('href', '/bower_components/google-code-prettify/src/prettify.css');
					document.getElementsByTagName('head')[0].appendChild(link);
					prettifyCSSLoaded = true;
				}
				//prettify.prettyPrint();
			});
		}
	);
}

var __transformResult = function(data) {
	if(!data) {
		return data;
	}
	data = '{"__result": ' + data + '}';
	var json = JSON.parse(data).__result;
	return json;
}

var __defaultHeaders = {
	'Content-Type': 'application/json'
}
if(window.RIOX_USER_ID) {
	__defaultHeaders["riox-auth-user-id"] = window.RIOX_USER_ID;
}
if(window.RIOX_APP_KEY) {
	__defaultHeaders["riox-auth-app-key"] = window.RIOX_APP_KEY;
}
if(window.RIOX_AUTH_TOKEN) {
	__defaultHeaders["riox-auth-token"] = window.RIOX_AUTH_TOKEN;
}
if(window.RIOX_AUTH_NETWORK) {
	__defaultHeaders["riox-auth-network"] = window.RIOX_AUTH_NETWORK;
}
$.ajaxSetup({
    headers: __defaultHeaders,
    converters: {
        "text json": function(data) {
			var result = JSON.parse( data + "" );
			return result; //{ __result: result };
		}
    }
});
if(typeof $.delete == "undefined") {
	$.delete = function(url, options) {
		if(!options) options = {};
		options.url = url;
		options.type = "DELETE";
		return $.ajax(options);
	};
}
if(typeof $.put == "undefined") {
	$.put = function(url, body, options) {
		if(!options) options = {};
		options.url = url;
		options.type = "PUT";
		options.data = body;
		return $.ajax(options);
	};
}

var __getCacheObj = function($http) {
	return !$http ? {} : !$http.cache ? {} : $http.cache;
};
var __getConfig = function($http) {
	var options = {
		headers: __defaultHeaders,
		transformResponse: __transformResult
	};
	var headers = $http ? $http.headers : {};
	if(!$http || !$http.get) {
		if(window.rootScope) {
			$http = rootScope.http;
		} else {
			$http = $;
			options = null;
		}
	}
	if(headers) {
		if(!options) options = {headers: {}};
		for(var key in headers) {
			options.headers[key] = headers[key];
		}
	}
	return {
		http: $http,
		options: options
	};
}

var getCache = function(cache, key) {
	if(!cache) return;
	//console.log("get cache", key, cache[key]);
	return cache[key];
};
var setCache = function(cache, key, value) {
	if(!cache) return;
	//console.log("set cache", key, value);
	var oldVal = cache[key];
	cache[key] = value;
	return oldVal;
};

sh.invokeGET = function($http, url, callback, errorCallback) {
	/* get from cache */
	var cacheKey = "" + url;
	var cache = __getCacheObj($http);
	var cacheValue = getCache(cache, cacheKey);
	//console.log("getting cache", cache, cacheKey, cacheValue);
	if(typeof cacheValue != "undefined") {
		return callback(cacheValue.__data, cacheValue.statusCode, cacheValue.headers, cacheValue);
	}

	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	$http.get(url, options).
	success(function(data, status, headers, config) {
		var cacheKey = "" + url;
		if(window.setLoadingStatus) setLoadingStatus(false);
		var cacheEntry = {__data: data, statusCode: status, headers: headers};
		//console.log("putting to cache", cacheKey, cache);
		setCache(cache, cacheKey, cacheEntry);
		callback(data, status, headers, config);
	}).
	error(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		//console.log("invocation error", data, status, headers);
		if(errorCallback) {
			errorCallback(data, status, headers, config);
		} else {
			__alertServiceError(config, status);
		}
	});
}

sh.invokePOST = function($http, url, body, callback, errorCallback) {
	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options || {};
	var params = {
		type: "POST",
		url: url,
		data: body,
		headers: options.headers
	};
	$http.ajax(params).
	success(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		callback(data, status, headers, config);
	}).
	error(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		if(errorCallback) {
			errorCallback(data, status, headers, config);
		} else {
			__alertServiceError(config, status);
		}
	});
}

sh.invokePOSTandGET = function($http, url, body, callback, errorCallback) {
	invokePOST($http, url, body,
		function(data, status, headers, config){
		var loc = headers("Location");
		invokeGET($http, loc, callback, errorCallback);
	}, errorCallback)
}

sh.invokePUT = function($http, url, body, callback, errorCallback) {
	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	$http.put(url, body, options).
	success(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		callback(data, status, headers, config);
	}).
	error(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		if(errorCallback) {
			errorCallback(data, status, headers, config);
		} else {
			__alertServiceError(config, status);
		}
	});
}

sh.invokeDELETE = function($http, url, callback) {
	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	return $http.delete(url, options).
	success(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		callback(data, status, headers, config);
	}).
	error(function(data, status, headers, config) {
		if(window.setLoadingStatus) setLoadingStatus(false);
		__alertServiceError(config, status);
	});
}

/* expose API */
var bindHook = (typeof module != "undefined") ? module.exports : (typeof window != "undefined") ? window : {};
bindHook.invokeGET = sh.invokeGET;
bindHook.invokePOST = sh.invokePOST;
bindHook.invokePOSTandGET = sh.invokePOSTandGET;
bindHook.invokePUT = sh.invokePUT;
bindHook.invokeDELETE = sh.invokeDELETE;

return sh;
})();
