'use strict';

var express = require('express');
var streamsCtrl = require('./streams.controller');
var sinksCtrl = require('./streamsinks.controller');
var sourcesCtrl = require('./streamsources.controller');
var procCtrl = require('./streamprocessors.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* METHODS FOR STREAMS */
router.get('/provided', auth.isAuthenticated(), sourcesCtrl.listProvided);
router.get('/consumed', auth.isAuthenticated(), sourcesCtrl.listConsumed);
router.post('/', auth.isAuthenticated(), streamsCtrl.createStream);
router.post('/:id/apply', auth.isAuthenticated(), streamsCtrl.applyStreamConfig);

/* METHODS FOR STREAM SOURCES */
router.get('/sources', auth.isAuthenticated(), sourcesCtrl.indexStreamSource);
router.get('/sources/:id', auth.isAuthenticated(), sourcesCtrl.showStreamSource);
router.delete('/sources/:id', auth.hasRole('admin'), sourcesCtrl.destroyStreamSource);
router.post('/sources', auth.isAuthenticated(), sourcesCtrl.createStreamSource);
router.post('/sources/apply', auth.isAuthenticated(), sourcesCtrl.applyStreamSource);
router.put('/sources/:id', auth.isAuthenticated(), sourcesCtrl.updateStreamSource);

/* METHODS FOR STREAM SINKS */
router.post('/sinks', auth.isAuthenticated(), sinksCtrl.createStreamSink);

/* METHODS FOR STREAM PROCESSORS */
router.post('/processors', auth.isAuthenticated(), procCtrl.createStreamProcessor);


module.exports = router;
