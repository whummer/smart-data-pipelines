'use strict';

var express = require('express');
var auth = require('riox-services-base/lib/auth/auth.service');
var deploymentsCtrl = require('./deployments.controller');
var router = express.Router();

router.get('/:id', auth.isAuthenticated(), deploymentsCtrl.findById);
router.get('/', auth.isAuthenticated(), deploymentsCtrl.listAll);
router.post('/', auth.isAuthenticated(), deploymentsCtrl.create);
router.put('/:id', auth.isAuthenticated(), deploymentsCtrl.update);
router.delete('/:id', auth.isAuthenticated(), deploymentsCtrl.delete);

module.exports = router;
