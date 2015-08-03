'use strict';

var express = require('express');
var controller = require('./access.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var StreamAccess = require('./streamaccess.model');
var Consumer = require('./consumer.model');

var router = express.Router();

/* access roles */
router.get('/roles', auth.isAuthenticated(), auth.fetchOrgs(), controller.listRoles);
router.post('/roles', auth.isAuthenticated(), auth.fetchOrgs(), controller.createRole);
router.put('/roles/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.updateRole);
router.delete('/roles/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.deleteRole);

/* consumers */
router.get('/consumers', auth.isAuthenticated(), auth.fetchOrgs(), controller.listConsumers);
router.get('/consumers/:apiKey', controller.getConsumerByApiKey);
router.post('/consumers', auth.isAuthenticated(), auth.fetchOrgs(), controller.createConsumer);
router.put('/consumers/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.updateConsumer);
router.delete('/consumers/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.deleteConsumer);
router.post('/consumers/:id/keys', auth.isAuthenticated(), auth.fetchOrgs(), controller.addKey);
router.delete('/consumers/:id/keys/:key', auth.isAuthenticated(), auth.fetchOrgs(), controller.removeKey);

/* access requests */
router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/:id/enable', auth.isAuthenticated(), controller.enableAccess);
router.post('/:id/disable', auth.isAuthenticated(), controller.disableAccess);
router.post('/', auth.isAuthenticated(), auth.fetchOrgs(), controller.create);
router.get('/source/:sourceId', auth.isAuthenticated(), auth.fetchOrgs(), controller.getBySource);
router.get('/source/:sourceId/consumer/:organizationId', auth.isAuthenticated(), auth.fetchOrgs(), controller.getBySource);

module.exports = router;
