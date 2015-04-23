'use strict';

process.env.TEST_MODE = true;
process.env.NODE_ENV = "test";
require('_/api/service.calls');

require('./integration/api/test.streams');
require('./integration/api/test.streamaccess');
require('./integration/api/test.users');
