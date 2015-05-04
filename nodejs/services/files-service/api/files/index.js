'use strict';

var express = require('express');
var mongoose = require('mongoose');
var controller = require('./files.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

/* define routes */
var router = express.Router();

router.post('/upload', auth.isAuthenticated(), controller.upload, controller.uploadFix);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/:id', /*auth.isAuthenticated(),*/ controller.download);
router.delete('/:id', auth.isAuthenticated(), controller.remove);

module.exports = router;
