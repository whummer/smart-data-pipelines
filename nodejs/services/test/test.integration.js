'use strict';

process.env.TEST_MODE = true;
process.env.NODE_ENV = "test";
require('riox-services-base/lib/api/service.calls');
global.servicesConfig = require('riox-services-base/lib/config/services');

beforeEach(function(){
  this.timeout(5000);
})

/* API tests */
require('./integration/api/test.streams');
require('./integration/api/test.streamaccess');
require('./integration/api/test.users');
require('./integration/api/test.organizations');

/* Streams integration tests */
require('./integration/streams/test.streams.apply');
require('./integration/api/test.files');
