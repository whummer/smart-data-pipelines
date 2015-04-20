'use strict';

var express = require('express');
var controller = require('./streams.controller');
var auth = require('_/auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/provided', auth.isAuthenticated(), controller.listProvided);
router.get('/consumed', auth.isAuthenticated(), controller.listConsumed);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;