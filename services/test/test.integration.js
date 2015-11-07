'use strict';

process.env.TEST_MODE = true;
process.env.RIOX_ENV = process.env.RIOX_ENV || "test";
process.env.NODE_ENV = process.env.RIOX_ENV;
require('riox-services-base/lib/api/service.calls');
global.servicesConfig = require('riox-services-base/lib/config/services').test.services;

beforeEach(function(){
	this.timeout(5000);
})

/* API tests */
require('./integration/api/test.users');
require('./integration/api/test.organizations');
require('./integration/api/test.files');

/* Streams integration tests */
require('./integration/pipes/test.store.pipes');
require('./integration/pipes/test.deploy.mavienna');
require('./integration/pipes/test.deploy.httpin-transform-split');

/* this tells the services and bootstrap scripts not 
 * to loop forever using setTimeout(..) etc. because 
 * otherwise the process would never terminate. */
global.avoidLoopingForever = true;

