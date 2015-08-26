"use strict";

(function(){

	var sh = {};

	sh.MAX_COMBINATIONS = 100;

	var isArray = function(someVar) {
		return Object.prototype.toString.call( someVar ) === '[object Array]';
	};
	var clone = function(obj) {
		return JSON.parse(JSON.stringify(obj));
	};
	/*
	 * http://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
	 */
	var cartesian = function(arg) {
	    var r = [], max = arg.length-1;
	    function helper(arr, i) {
	        for (var j=0, l=arg[i].length; j<l; j++) {
	            var a = arr.slice(0); // clone arr
	            a.push(arg[i][j]);
	            if (i==max)
	                r.push(a);
	            else
	                helper(a, i+1);
	        }
	    }
	    helper([], 0);
	    return r;
	};

	sh.getObjectIDs = function(url, indexName, typeName, idFields) {
		if(!isArray(idFields)) idFields = [idFields];
		var promise = new Promise(function(resolve){resolve()});

		var max = 1000;
		var query = {
			aggregations: {}
		};
		query.aggregations[typeName] = {
			terms: {
				size: max
			}
		};
		var result = {};

		function doQuery (query, fld) {
			return (function() {
				return new Promise(function(resolve) {
					var theUrl = url + indexName + "/_search?search_type=count&size=" + max;
					riox.callPOST(theUrl, query, function(data) {
						var list = [];
						data.aggregations[typeName].buckets.forEach(function(bucket) {
							list.push(bucket["key"]);
						});
						result[fld] = list;
						resolve(list);
					});
				});
			});
		};
		for(var i = 0; i < idFields.length; i ++) {
			var field = idFields[i];
			query.aggregations[typeName].terms.field = field;
			promise = promise.then(doQuery(clone(query), field));
		}
		promise = promise.then(function() {
			return result;
		})

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

	sh.getObjectDetails = function(url, indexName, typeName, queryFields, timeField) {
		var query = "";
		for(var key in queryFields) {
			query += key + ":" + queryFields[key] + " ";
		}
		return sh.find(url, indexName, typeName, query, timeField, "desc", 1);
	};

	sh.getAllObjectDetails = function(url, indexName, typeName, idField, ids, timeField) {
		var promise = new Promise(function(resolve){resolve();});
		var result = [];
		var idLists = [];
		var keyList = [];
		for(var key in ids) {
			idLists.push(ids[key]);
			keyList.push(key);
		}
		var combinations = cartesian(idLists);

		function doGet(combination) {
			var query = {};
			for(var i = 0; i < combination.length; i ++) {
				query[keyList[i]] = combination[i];
			}
			return (function() {
				return new Promise(function(resolve) {
					sh.getObjectDetails(url, indexName, typeName, query, timeField).
					then(function(details) {
						result.push(details);
						resolve(details);
					});
				});
			});
		};
		
		if(combinations.length <= sh.MAX_COMBINATIONS) {
			for(var i = 0; i < combinations.length; i ++) {
				promise = promise.then(doGet(combinations[i]));
			}
		} else {
			/* error: too many results */
			/* TODO: performance of this approach is suboptimal 
			 * as we perform a LOT of single elasticsearch requests!
			 * TODO: find a way to better batch-query the results. */
			result = null;
		}
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
