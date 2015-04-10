'use strict';

var express = require('express');
var service = require('./service.organizations');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), service.index);
router.delete('/:id', auth.hasRole('admin'), service.destroy);
router.get('/:id', auth.isAuthenticated(), service.show);
router.post('/', service.create);

module.exports = router;
