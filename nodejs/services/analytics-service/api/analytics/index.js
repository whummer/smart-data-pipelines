'use strict';

var express = require('express');
var controller = require('./analytics.controller.js');
var config = require('../../config/environment');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/functions', /* auth.hasRole('admin'), */ controller.index);
router.get('/', /* auth.hasRole('admin'), */ controller.index);
//router.get('/:id', auth.isAuthenticated(), controller.show);
//router.delete('/:id', auth.hasRole('admin'), controller.destroy);
//router.post('/', controller.createAnalyticsElement);
//router.put('/:id', controller.update);

module.exports = router;
