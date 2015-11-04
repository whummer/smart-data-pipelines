// TODO: whu: dont hardcode modules here...
// TODO: remove altogether!

var modules = [
 	{
		type: "sink",
		name: "elasticsearch",
		coordinates: "riox:" +
			"elasticsearch-sink:" +
			"1.0.0.BUILD-SNAPSHOT"
	},{
		type: "processor",
		name: "http-client",
		coordinates: "riox:" +
			"httpclient-processor:" +
			"1.0.0.BUILD-SNAPSHOT"
	},{
		type: "processor",
		name: "enricher-csv",
		coordinates: "riox:" +
			"csv-enricher-processor:" +
			"1.0.0.BUILD-SNAPSHOT"
	},{
		type: "processor",
		name: "split",
		coordinates: "riox:" +
			"split-processor:" +
			"1.0.0.BUILD-SNAPSHOT"
	}
];

exports.listModules = function() {
	return modules;
};

