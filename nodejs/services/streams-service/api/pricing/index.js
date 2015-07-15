'use strict';

var express = require('express');
var controller = require('./pricing.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* define routes */

router.get('/plans', auth.isAuthenticated(), controller.showPlans);
router.post('/plans', auth.isAuthenticated(), controller.addPlan);
router.put('/plans/:id', auth.isAuthenticated(), controller.savePlan);
router.delete('/plans/:id', auth.isAuthenticated(), controller.deletePlan);


module.exports = router;
