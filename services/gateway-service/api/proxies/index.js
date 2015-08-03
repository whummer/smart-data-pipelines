'use strict';

var express = require('express');
var controller = require('./proxies.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* Define routes */
router.get('/all', auth.hasRole('admin'), controller.listAll);
router.get('/', auth.isAuthenticated(), auth.fetchOrgs(), controller.list);
router.get('/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.show);
router.post('/', auth.isAuthenticated(), auth.fetchOrgs(), controller.create);
router.put('/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.update);
router.delete('/:id', auth.isAuthenticated(), auth.fetchOrgs(), controller.destroy);

module.exports = router;
