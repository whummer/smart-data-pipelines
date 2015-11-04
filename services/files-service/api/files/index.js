'use strict';

var express = require('express');
var controller = require('./files.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

/* define routes */
var router = express.Router();

router.post('/upload', auth.isAuthenticated(), controller.upload, controller.uploadFix);
router.post('/:id', auth.isAuthenticated(), controller.update, controller.updateFix);
router.get('/:id', /*auth.isAuthenticated(),*/ controller.download);
router.delete('/:id', auth.isAuthenticated(), controller.remove);

module.exports = router;
