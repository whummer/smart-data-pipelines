'use strict';

var express = require('express');
var auth = require('riox-services-base/lib/auth/auth.service');
var deploymentsCtrl = require('./deployments.controller');
var router = express.Router();

router.post('/', auth.isAuthenticated(), deploymentsCtrl.create);
router.get('/:id', auth.isAuthenticated(), deploymentsCtrl.find);
router.get('/', auth.isAuthenticated(), deploymentsCtrl.list);

module.exports = router;
