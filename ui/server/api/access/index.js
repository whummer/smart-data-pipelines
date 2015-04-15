'use strict';

var express = require('express');
var mongoose = require('mongoose');
var controller = require('./service.access');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var StreamAccess = require('./streamaccess.model');
var ModelUtil = require("../../model/model.util");

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
