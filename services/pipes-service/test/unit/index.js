'use strict';

process.env.TEST_MODE = true;
process.env.RIOX_ENV = process.env.RIOX_ENV || 'test';
process.env.NODE_ENV = process.env.RIOX_ENV

var riox = require('riox-shared/lib/api/riox-api');

require('./pipes/deployments/springcdf/mapping/test.http-out');
require('./pipes/deployments/springcdf/mapping/test.map');
require('./pipes/deployments/springcdf/mapping/test.script');
require('./pipes/deployments/springcdf/test.springcdf.connector'); // TODO fix test
