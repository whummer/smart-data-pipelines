'use strict';

var express = require('express');
var pipesCtrl = require('./pipes.controller');
var sinksCtrl = require('./pipesinks.controller');
var sourcesCtrl = require('./pipesources.controller');
var procCtrl = require('./pipeprocessors.controller');
var auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

/* BOOTSTRAP (enter API metadata) */
router.post('/_bootstrap', pipesCtrl.bootstrap);

/* METHODS FOR PIPES */
router.get('/', auth.isAuthenticated(), pipesCtrl.listAll);

router.get('/provided', auth.isAuthenticated(), auth.fetchOrgs(), sourcesCtrl.listProvided);
router.get('/provided/by/name/:name', auth.isAuthenticated(), auth.fetchOrgs(), sourcesCtrl.listProvidedByName);
router.get('/consumed', auth.isAuthenticated(), sourcesCtrl.listConsumed);

router.post('/', auth.isAuthenticated(), pipesCtrl.create);
router.post('/:id/apply', auth.isAuthenticated(), pipesCtrl.apply);

/* METHODS FOR SOURCES */
router.get('/sources/all', auth.hasRole('admin'), sourcesCtrl.indexAll);
router.get('/sources', auth.isAuthenticated(), sourcesCtrl.index);
router.get('/sources/:id', auth.isAuthenticated(), sourcesCtrl.show);
router.delete('/sources/:id', auth.hasRole('admin'), sourcesCtrl.destroy);
router.post('/sources', auth.isAuthenticated(), sourcesCtrl.create);
router.post('/sources/:id/apply', auth.isAuthenticated(), sourcesCtrl.apply);
router.put('/sources/:id', auth.isAuthenticated(), sourcesCtrl.update);

/* METHODS FOR SINKS */
router.get('/sinks', auth.isAuthenticated(), auth.fetchOrgs(), sinksCtrl.index);
router.post('/sinks', auth.isAuthenticated(), sinksCtrl.create);

/* METHODS FOR PROCESSORS */
router.get('/processors', auth.isAuthenticated(), procCtrl.index);
router.get('/processors/:id', auth.isAuthenticated(), procCtrl.show);
router.post('/processors', auth.isAuthenticated(), procCtrl.create);


module.exports = router;
