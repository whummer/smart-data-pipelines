'use strict';

module.exports = {

	mongo: {
		baseurl: appConfig["production"].infra.mongodb.baseurl
	},

	statsd: {
		hostname: appConfig["production"].infra.statsd.hostname
	},

	zookeeper: {
		host: appConfig["production"].infra.zookeeper.host
	},
	
	driver: appConfig["production"].infra.redis.url

};