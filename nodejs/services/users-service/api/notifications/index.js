'use strict';

var express = require('express');
var controller = require('./notifications.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated() , controller.show);
router.delete('/:id', auth.isAuthenticated(), controller.delete);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/', auth.isAuthenticated(), controller.update);

module.exports = router;
