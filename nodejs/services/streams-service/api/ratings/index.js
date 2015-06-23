'use strict';

var express = require('express');
var controller = require('./ratings.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* define routes */
router.post('/permit', auth.isAuthenticated(), controller.logAndPermit);
router.get('/limits', auth.isAuthenticated(), controller.showLimits);
router.post('/limits', auth.isAuthenticated(), controller.addLimit);
router.put('/limits/:id', auth.isAuthenticated(), controller.saveLimit);
router.delete('/limits/:id', auth.isAuthenticated(), controller.deleteLimit);

module.exports = router;
