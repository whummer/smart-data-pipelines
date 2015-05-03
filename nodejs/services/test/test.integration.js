'use strict';

process.env.TEST_MODE = true;
process.env.NODE_ENV = "test";
require('riox-services-base/lib/api/service.calls');

beforeEach(function(){
  this.timeout(5000);
})


require('./integration/api/test.streams');
require('./integration/api/test.streamaccess');
require('./integration/api/test.users');
require('./integration/api/test.organizations');

