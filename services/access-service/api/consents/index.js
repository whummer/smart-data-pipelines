'use strict';

var express = require('express');
var controller = require('./consents.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var AccessConsent = require('./accessconsent.model');

/* define routes */
var router = express.Router();
router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/user/:userId', controller.listByOwner);
router.post('/', auth.isAuthenticated(), auth.fetchOrgs(), controller.create);
router.post('/:id/enable', controller.enableConsent);
router.post('/:id/disable', controller.disableConsent);

module.exports = router;
