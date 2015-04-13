'use strict';

var express = require('express');
var service = require('./service.users');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), service.index);
router.delete('/:id', auth.hasRole('admin'), service.destroy);
router.get('/me', auth.isAuthenticated(), service.me);
router.put('/:id/password', auth.isAuthenticated(), service.changePassword);
router.get('/:id', auth.isAuthenticated(), service.show);
router.post('/', service.create);
router.post('/auth', service.auth);

module.exports = router;
