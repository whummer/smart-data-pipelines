'use strict';
require("babel/register"); // enable ES6 features

var express = require('express'),
		pipesCtrl = require('./pipes.controller'),
		auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

//
// CRUD for data pipes
//
router.get('/', auth.isAuthenticated(), pipesCtrl.listAll);
router.get('/:id', auth.isAuthenticated(), pipesCtrl.findById);
router.post('/', auth.isAuthenticated(), pipesCtrl.create);
router.put('/:id', auth.isAuthenticated(), pipesCtrl.update);
router.delete('/:id', auth.isAuthenticated(), pipesCtrl.delete);

module.exports = router;