'use strict';

var express = require('express');
var controller = require('./certificates.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.getOwn);
router.get('/:id', auth.isAuthenticated() , controller.show);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);

module.exports = router;
