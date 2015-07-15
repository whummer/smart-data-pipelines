/**
 * Defines metadata about the available analytics functions.
 * This is currently defined statically. We expect to do this dynamically
 * by either allowing an "admin" area where this can be defined.
 */



var AnalyticsFunction = require("../api/analytics/analytics.model");

var data = [
	{
		name: "moving_function",
		description: "Calculates basic \"moving\" functions (sum, avg, min, max) over a list of N items",
		"input-type": "application/x-xd-tuple",
		input: [
			{
				key: "itemPath",
				"value-type": "String",
				description: "The path to the data item for calculating the moving average (e.g., cardata.fuel-level)",
			},
			{
				key: "items",
				description: "The number of items considered for the average calculation",
				"value-type": "Number"
			},
			{
				key: "function",
				description: "The mathematical function to use",
				"value-type": "String",
				"valid-values": [ "AVG", "MIN", "MAX", "SUM"]
			}
		],
		output: [{
			key: "riox-analytics.moving_function",
			"value-type": "Number"
		}]
	},

	{
		name: "geo_fence_circular",
		description: "",
		"input-type": "application/x-xd-tuple",

		"input": [
			{
				key: "latitude",
				description: "The geo-fence center latitude",
				"value-type": "Number"
			},
			{
				key: "longitude",
				description: "The geo-fence center longitude",
				"value-type": "Number"
			},
			{
				key: "radius",
				description: "The radius for the geo-fence (in meters)",
				"value-type": "Number"
			},
			{
				key: "latPath",
				description: "The path to the latitude data item",
				"value-type": "String"
			},
			{
				key: "longPath",
				description: "The path to the longitude data item",
				"value-type": "String"
			}],
		output: [{
			key: "riox-analytics.inside_geofence",
			"value-type": "Boolean"
		}]
	}
]

var log = global.log || require('winston');
require('promise');

var doIt = function(globalResolve, reject) {
	AnalyticsFunction.find({}, function (err, list) {
		if (err) {
			console.error(err);
			return;
		}
		var localPromise = new Promise(function(resolve) {resolve()}); // TODO
		if (!list || !list.length) {
			data.forEach(function (el) {
				localPromise = localPromise.then(new Promise(function(resolve, reject) {
					var o = new AnalyticsFunction(el);
					o.save(resolve);
					log.debug("local prom");
				}))
			});
			localPromise.then(function(resolve, reject) {
				globalResolve();
				log.debug("global prom");
			});
		}
	});
};
var globalPromise = new Promise(doIt);

module.exports = globalPromise;
