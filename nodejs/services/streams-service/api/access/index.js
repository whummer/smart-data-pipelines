'use strict';

var express = require('express');
var controller = require('./access.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var StreamAccess = require('./streamaccess.model');

/* define routes */
var router = express.Router();
router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/source/:sourceId', auth.isAuthenticated(), controller.getBySource);
router.get('/source/:sourceId/consumer/:organizationId', auth.isAuthenticated(), controller.getBySource);

module.exports = router;
