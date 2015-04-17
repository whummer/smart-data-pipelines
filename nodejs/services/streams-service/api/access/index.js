'use strict';

var express = require('express');
var mongoose = require('mongoose');
var controller = require('./access.controller');
var auth = require('_/auth/auth.service');
var StreamAccess = require('./stream.access');
var ModelUtil = require("_/model/model.util");

/* export schemas to mongo */
ModelUtil.exportModelSchema(StreamAccess);

/* define routes */
var router = express.Router();
router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/stream/:streamId', auth.isAuthenticated(), controller.getByStream);
router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
