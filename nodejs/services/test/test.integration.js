'use strict';

require('_/api/service.calls');
process.env.TEST_MODE = true;

require('./integration/api/test.streams');
require('./integration/api/test.streamaccess');
require('./integration/api/test.users');
