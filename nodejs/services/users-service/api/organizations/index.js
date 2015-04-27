'use strict';

var express = require('express');
var controller = require('./organizations.controller');
var config = require('../../config/environment');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/all', auth.hasRole('admin'), controller.index);
router.get('/', auth.isAuthenticated(), controller.getOwnAll);
router.get('/default', auth.isAuthenticated(), controller.getOwnDefault);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/membership', auth.isAuthenticated(), controller.updateMembership);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.post('/invite', auth.isAuthenticated(), controller.invite);

module.exports = router;
