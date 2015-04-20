/** 
 * @author whummer
 */

(function() {

var sh = {};

var prettifyCSSLoaded = false;
var __alertServiceError = function(config, status) {
	if(!window.showErrorDialog) {
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
	data = '{"result": ' + data + '}';
	json = JSON.parse(data);
	return json;
}

var __defaultHeaders = {
	'Content-Type': 'application/json'
}
if(window.RIOTS_USER_ID) {
	__defaultHeaders["riots-auth-user-id"] = window.RIOTS_USER_ID;
}
if(window.RIOTS_APP_KEY) {
	__defaultHeaders["riots-auth-app-key"] = window.RIOTS_APP_KEY;
}
if(window.RIOTS_AUTH_TOKEN) {
	__defaultHeaders["riots-auth-token"] = window.RIOTS_AUTH_TOKEN;
}
if(window.RIOTS_AUTH_NETWORK) {
	__defaultHeaders["riots-auth-network"] = window.RIOTS_AUTH_NETWORK;
}
$.ajaxSetup({
    headers: __defaultHeaders,
    converters: {
        "text json": function(data) {
			var result = JSON.parse( data + "" );
			return { result: result };
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

var __getConfig = function($http) {
	var options = {
		headers: __defaultHeaders,
		transformResponse: __transformResult
	};
	if(!$http) {
		if(window.rootScope) {
			$http = rootScope.http;
		} else {
			$http = $;
			options = null;
		}
	}
	return {
		http: $http,
		options: options
	};
}

sh.invokeGET = function($http, url, callback, errorCallback) {
	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	$http.get(url, options).
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

sh.invokePOST = function($http, url, body, callback, errorCallback) {
	if(window.setLoadingStatus) setLoadingStatus(true);
	var cfg = __getConfig($http);
	$http = cfg.http;
	var options = cfg.options;
	$http.post(url, body, options).
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

sh.invokePOSTandGET = function($http, url, body, callback) {
	invokePOST($http, url, body, 
		function(data, status, headers, config){
		var loc = headers("Location");
		invokeGET($http, loc, callback);
	})
}

sh.invokePUT = function($http, url, body, callback) {
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
		__alertServiceError(config, status);
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
// TODO: don't bind to window!
window.invokeGET = sh.invokeGET;
window.invokePOST = sh.invokePOST;
window.invokePOSTandGET = sh.invokePOSTandGET;
window.invokePUT = sh.invokePUT;
window.invokeDELETE = sh.invokeDELETE;
return sh;
})();