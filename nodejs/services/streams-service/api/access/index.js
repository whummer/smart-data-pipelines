'use strict';

var express = require('express');
var mongoose = require('mongoose');
var controller = require('./access.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var StreamAccess = require('./streamaccess.model');

/* define routes */
var router = express.Router();
router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/stream/:streamId', auth.isAuthenticated(), controller.getByStream);
router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
