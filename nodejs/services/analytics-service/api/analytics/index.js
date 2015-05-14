'use strict';

var express = require('express');
var controller = require('./analytics.controller.js');
var config = require('../../config/environment');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
//router.post('/', auth.hasRole('admin'), controller.create);
//router.put('/:id', auth.hasRole('admin'), controller.update);
//router.delete('/:id', auth.hasRole('admin'), controller.delete);

module.exports = router;
