'use strict';

process.env.TEST_MODE = true;
process.env.NODE_ENV = process.env.RIOX_ENV = "test";
process.env.RIOX_ENV = 'development' // FR TODO: temp fix to run locally
require('riox-services-base/lib/api/service.calls');
global.servicesConfig = require('riox-services-base/lib/config/services').test.services;

beforeEach(function(){
	this.timeout(5000);
})

/* API tests */
//require('./integration/api/test.streams');
//require('./integration/api/test.streamaccess');
//require('./integration/api/test.streamconsents');
require('./integration/api/test.users');
require('./integration/api/test.organizations');
require('./integration/api/test.files');
//require('./integration/api/test.analytics');

/* Streams integration tests */
require('./integration/pipes/test.springxd.connector');
require('./integration/pipes/test.pipes');
require('./integration/pipes/test.pipes.deployments');

/* Stream integration test with analytics */
//require('./integration/streams/test.moving-avg.apply.js');
