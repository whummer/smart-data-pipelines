'use strict';

var express = require('express');
var controller = require('./streams.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

router.get('/provided', auth.isAuthenticated(), controller.listProvided);
router.get('/consumed', auth.isAuthenticated(), controller.listConsumed);

router.get('/sources', auth.isAuthenticated(), controller.indexStreamSource);
router.get('/sources/:id', auth.isAuthenticated(), controller.showStreamSource);
router.delete('/sources/:id', auth.hasRole('admin'), controller.destroyStreamSource);

// creates a stream source
router.post('/sources', auth.isAuthenticated(), controller.createStreamSource);

// update an existing stream source
router.put('/sources/:id', auth.isAuthenticated(), controller.updateStreamSource);

// creates a stream processing element
//router.post('/processors', auth.isAuthenticated(), controller.updateStreamSource);;




// creates a stream sink
//router.post('/sinks');

module.exports = router;
