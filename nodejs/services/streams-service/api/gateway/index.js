'use strict';

var express = require('express');
var controller = require('./gateway.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* define routes */
router.post('/apply', controller.apply);

/* perform initial 'apply' after the service has started */
setTimeout(function() {
	controller.apply();
}, 2000);

module.exports = router;
