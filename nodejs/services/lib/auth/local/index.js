'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
	console.log("router.post", req.body);
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
	  console.log("router.post result", error);
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

router.get('/', function(req, res, next) {
	console.log("TODO verify"); // TODO
});

module.exports = router;