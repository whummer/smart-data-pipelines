'use strict';

var express = require('express');
var controller = require('./proxies.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* Define routes */
router.get('/', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.add);
router.put('/:id', auth.isAuthenticated(), controller.save);
router.delete('/:id', auth.isAuthenticated(), controller.delete);

module.exports = router;
