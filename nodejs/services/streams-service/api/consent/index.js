'use strict';

var express = require('express');
var controller = require('./consent.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var AccessConsent = require('./accessconsent.model');

/* define routes */
var router = express.Router();
router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
