'use strict';

var express = require('express');
var controller = require('./organizations.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/all', auth.hasRole('admin'), controller.index);
router.get('/', auth.isAuthenticated(), controller.getOwnAll);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/default', auth.isAuthenticated(), controller.getOwnDefault);
router.get('/:id', /* auth.isAuthenticated() ,*/ controller.show);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.post('/:id/invite', auth.isAuthenticated(), controller.invite);
router.get('/:id/memberships', auth.isAuthenticated(), auth.fetchOrgs(), controller.listMemberships);
router.put('/:id/memberships', auth.isAuthenticated(), controller.updateMembership);
router.get('/memberships/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.showMembership);
router.delete('/memberships/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.deleteMembership);

module.exports = router;
