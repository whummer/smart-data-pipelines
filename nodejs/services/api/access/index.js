'use strict';

var express = require('express');
var mongoose = require('mongoose');
var controller = require('./access.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var StreamAccess = require('./stream.access');
var ModelUtil = require("../../model/model.util");

/* export schemas to mongo */
ModelUtil.exportModelSchema(StreamAccess);

/* define routes */
var router = express.Router();
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.get('/stream/:id', auth.isAuthenticated(), controller.getByStream);
router.post('/', controller.create);

module.exports = router;
