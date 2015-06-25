(function() {
	function getVal(val, dflt, doParse) {
		if(!val || val === "")
			val = dflt;
		if(doParse)
			val = parseInt(""+val);
		return val;
	}
	var cfg = {
		graphitePort: parseInt(process.env.GRAPHITE_PORT) || 2003,
		graphiteHost: process.env.GRAPHITE_HOST || "localhost",
		port: parseInt(process.env.STATSD_PORT) || 8125,

		mongoHost: getVal(process.env.MONGO_HOST, 'mongo.dev.riox.internal'),
		mongoPort: getVal(process.env.MONGO_PORT, 27017, true),
		mongoName: getVal(process.env.MONGO_DB, 'riox-statsd'),
		mongoMax: 2160, 
		mongoPrefix: true,

		backends: ['/usr/local/lib/node_modules/mongo-statsd-backend/lib/index.js']
	};
	console.log(cfg);
	return cfg;
})()
