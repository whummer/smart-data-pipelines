'use strict';

var express = require('express');
var controller = require('./organizations.controller');
var config = require('_/config/environment');
var auth = require('_/auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/', controller.create);
router.put('/:id', controller.update);

module.exports = router;
