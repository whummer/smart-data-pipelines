"use strict";

(function(){

	var sh = {};

	sh.getObjectIDs = function(url, indexName, typeName, idField) {
		var promise = new Promise(function(resolve) {
			var query = {
				"aggregations": {}
			};
			var max = 1000;
			query.aggregations[typeName] = {
				"terms": {
					"field": idField,
					"size": max
				}
			};
			var theUrl = url + indexName + "/_search?search_type=count&size=" + max;
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

	sh.find = function(url, indexName, typeName, query, sort, order, size) {
		if(!order) order = "desc";
		if(!size) size = "10";
		var promise = new Promise(function(resolve) {
			var theUrl = url + indexName + "/" + 
					typeName + "/_search?q=" + query +
					(!sort ? "" : ("&sort=" + sort + ":" + order)) +
					"&size=" + size;
			riox.callGET(theUrl, function(data) {
				var result = [];
				if(!data.hits.hits.length) {
					console.log("No results for query:", theUrl);
					return resolve(result);
				}
				for(var i = 0; i < data.hits.hits.length; i ++) {
					result.push(data.hits.hits[i]._source);
				}
				if(size == 1) {
					var result = result[0];
				}
				resolve(result);
			});
		});
		return promise;
	};

	sh.getObjectDetails = function(url, indexName, typeName, idField, id, timeField) {
		return sh.find(url, indexName, typeName, idField + ":" + id, timeField, "desc", 1);
	};

	sh.getAllObjectDetails = function(url, indexName, typeName, idField, ids, timeField) {
		var promise = new Promise(function(resolve){resolve();});
		var result = [];
		ids.forEach(function(id) {
			promise = promise.then(function() {
				return new Promise(function(resolve) {
					sh.getObjectDetails(url, indexName, typeName, idField, id, timeField).
					then(function(details) {
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

	sh.getTimeseries = function(url, indexName, typeName, search, timeField, size) {
		if(!size) size = 50;
		var promise = new Promise(function(resolve){resolve();});
		return sh.find(url, indexName, typeName, search, timeField, "desc", size).then(
				function(result) {
					//console.log(result);
					result.reverse();
					return result;
				}
		);
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
