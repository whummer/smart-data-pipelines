'use strict';
require("babel/register"); // enable ES6 features

var express = require('express'),
		pipeElementsCtrl = require('./pipeelement.controller'),
		auth = require('riox-services-base/lib/auth/auth.service');

var router = express.Router();

//
// CRUD for pipeelements
//
router.get('/', auth.isAuthenticated(), pipeElementsCtrl.listAll);
router.get('/nodes', auth.isAuthenticated(), pipeElementsCtrl.listNodeRedNodes);
router.get('/nodes_html', auth.isAuthenticated(), pipeElementsCtrl.listNodeRedNodesHtml);
router.get('/:id', auth.isAuthenticated(), pipeElementsCtrl.findById);
router.post('/', auth.isAuthenticated(), pipeElementsCtrl.create);
router.delete('/:id', auth.isAuthenticated(), pipeElementsCtrl.delete);

module.exports = router;
