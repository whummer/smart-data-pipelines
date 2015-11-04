'use strict';

var express = require('express');
var auth = require('riox-services-base/lib/auth/auth.service');
var deploymentsCtrl = require('./deployments.controller');
var router = express.Router();

router.put('/preview', auth.isAuthenticated(), auth.fetchOrgs(), deploymentsCtrl.preview);
router.put('/deploy', auth.isAuthenticated(), auth.fetchOrgs(), deploymentsCtrl.deploy);
router.post('/by/pipe/:pipeID/input/:inputID', auth.isAuthenticated(), auth.fetchOrgs(), deploymentsCtrl.input);
router.get('/by/pipe/:id', auth.isAuthenticated(), deploymentsCtrl.findByPipeId);
router.get('/:id', auth.isAuthenticated(), deploymentsCtrl.findById);
router.get('/', auth.isAuthenticated(), deploymentsCtrl.listAll);
router.delete('/:id', auth.isAuthenticated(), deploymentsCtrl.delete);

module.exports = router;
