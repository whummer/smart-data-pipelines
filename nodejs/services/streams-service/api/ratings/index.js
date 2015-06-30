'use strict';

var express = require('express');
var controller = require('./ratings.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* routes for external access */
router.get('/limits', auth.isAuthenticated(), controller.showLimits);
router.post('/limits', auth.isAuthenticated(), controller.addLimit);
router.put('/limits/:id', auth.isAuthenticated(), controller.saveLimit);
router.delete('/limits/:id', auth.isAuthenticated(), controller.deleteLimit);
router.post('/limits/query', auth.hasRole("admin"), controller.queryLimits);

router.post('/invocations', auth.hasRole("admin"), controller.queryInvocations);
router.put('/invocations/:id', auth.hasRole("admin"), controller.updateInvocation);

/* routes for internal access */
router.post('/logAndPermit', controller.logAndPermit);

module.exports = router;
