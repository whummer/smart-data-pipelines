'use strict';

var express = require('express');
var controller = require('./users.controller');
var config = require('../../config/environment');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/me', auth.isAuthenticated(), controller.saveMe);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.post('/', controller.create);
router.get('/search', auth.isAuthenticated(), controller.search);
router.use('/auth', require('./auth'));
router.post('/auth', controller.auth);
router.post('/activation', controller.activate);
router.post('/activation/:key/send', controller.activate);
router.get('/:id', auth.isAuthenticated(), controller.show);

/* make sure we have the user account for internal calls available */
controller.insertInternalCallUser();

module.exports = router;
