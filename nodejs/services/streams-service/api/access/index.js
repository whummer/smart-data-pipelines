'use strict';

var express = require('express');
var controller = require('./access.controller');
var auth = require('riox-services-base/lib/auth/auth.service');
var StreamAccess = require('./streamaccess.model');

var router = express.Router();

/* access roles */
router.get('/roles', auth.isAuthenticated(), auth.fetchOrgs(), controller.listRoles);
router.post('/roles', auth.isAuthenticated(), auth.fetchOrgs(), controller.createRole);
router.put('/roles/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.updateRole);
router.delete('/roles/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.deleteRole);

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
