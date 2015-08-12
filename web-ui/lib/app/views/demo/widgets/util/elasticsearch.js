"use strict";

(function(){

	var sh = {};

	sh.getObjectIDs = function(url, indexName, typeName, idField) {
		var promise = new Promise(function(resolve) {
			var query = {
				"aggregations": {}
			};
			query.aggregations[typeName] = {
				"terms": {
					"field": idField
				}
			};
			var theUrl = url + indexName + "/_search?search_type=count&size=100";
			riox.callPOST(theUrl, query, function(data) {
				var result = [];
				data.aggregations[typeName].buckets.forEach(function(bucket) {
					result.push(bucket["key"]);
				});
				resolve(result);
			});
		});
		return promise;
	};

	sh.getObjectDetails = function(url, indexName, typeName, idField, id) {
		var promise = new Promise(function(resolve) {
			var theUrl = url + indexName + "/" + 
					typeName + "/_search?q=" + idField + ":" + id + 
					"&sort=_timestamp:desc&size=1";
			riox.callGET(theUrl, function(data) {
				var result = data.hits.hits[0]._source;
				resolve(result);
			});
		});
		return promise;
	};

	sh.getAllObjectDetails = function(url, indexName, typeName, idField, ids) {
		var promise = new Promise(function(resolve){resolve();});
		var result = [];
		ids.forEach(function(id) {
			promise = promise.then(function() {
				return new Promise(function(resolve) {
					sh.getObjectDetails(url, indexName, typeName, idField, id).then(function(details) {
						result.push(details);
						resolve(details);
					});
				});
			})
		});
		promise = promise.then(function() {
			return result;
		});
		return promise;
	};

	/* bind API */
	if(typeof module != "undefined") {
		for(var key in sh) {
			module.exports[key] = sh[key];
		}
	} else if(typeof window != "undefined") {
		window.elasticsearch = sh;
	}
	return sh;
})();
