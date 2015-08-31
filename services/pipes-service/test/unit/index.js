'use strict';

process.env.TEST_MODE = true;
process.env.RIOX_ENV = process.env.RIOX_ENV || 'test';
process.env.NODE_ENV = process.env.RIOX_ENV

require('./pipes/deployments/springxd/mapping/test.http-out');
require('./pipes/deployments/springxd/mapping/test.map');
require('./pipes/deployments/springxd/mapping/test.script');
require('./pipes/deployments/springxd/test.springxd.connector');
