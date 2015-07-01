'use strict';

var express = require('express');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var User = require('../../../user.model');

var router = express.Router();

var getOrInsertUser = function(apiKey, callback, errorCallback) {
	var query = {};
	query[API_KEY] = apiKey;
	User.find(query, function(err, user) {
		if(err)
			return errorCallback(err);
		if(user && user[0])
			return callback(user[0]);

		var user = new User();
		user[API_KEY] = apiKey;
		user[NAME] = "Anonymous User";
		user[ROLE] = "apiKey";
		user.save(function(err, user) {
			if(err)
				return errorCallback(err);
			return callback(user);
		});
	});
};

router.post('/', function(req, res, next) {
	var apiKey = req.body[API_KEY];

	if (!apiKey) return res.status(400).json({error: "Please provide " + API_KEY});

	riox.access.consumer(apiKey, function(consumer) {

		getOrInsertUser(apiKey, function(user) {
			var token = auth.signToken(user._id, user.role);
			res.json({token: token});
		}, function(error) {
			res.status(400).json({error: "Unable to get user for API Key:" + error});
		});

	}, function(error) {
		res.status(401).json({error: "This is not a valid API Key"});
	});
});

module.exports = router;
