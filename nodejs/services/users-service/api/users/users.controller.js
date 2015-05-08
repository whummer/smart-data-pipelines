'use strict';

var User = require('./user.model');
var passport = require('passport');
var mongoose = require('mongoose');
var config = require('../../config/environment');
var riox = require('riox-shared/lib/api/riox-api');
var auth = require('riox-services-base/lib/auth/auth.service');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Authentication request
 */
exports.auth = function(req, res) {
	res.json(200, {}); // TODO check token
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);

    var token = auth.signToken(user._id);
    var headers = auth.getHeaderFromToken(token);

    var org = {name: "Default Organization"};
    //var token = auth.getInternalCallToken();
    riox.add.organization(org, {
    	callback: function(org) {
    		res.json({ token: token });
    	},
    	headers: headers
    },
    function(error) {
    	res.json(500, error);
    });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.send(404);
    res.json(user);
  });
};

/**
 * Update my info.
 */
exports.saveMe = function(req, res, next) {
	var user = auth.getCurrentUser(req);
	var userId = req.user._id;
	if(userId != user.id) {
		return res.send(422);
	}
	var newUser = new User(req.body);
	User.findOne({
	    _id: userId
	}, '-salt -hashedPassword', function(err, existingUser) { // don't ever give out the password or salt
	    if (err) return next(err);
	    if (!existingUser) return res.send(404);
	    if(existingUser.email != newUser.email) return res.json(422); // don't allow email updates here

	    /* copy user info */
	    existingUser.address = newUser.address;
	    existingUser.firstname = newUser.firstname;
	    existingUser.lastname = newUser.lastname;

	    existingUser.save(function(err, userResult) {
	    	if(err) return res.send(401);
		    res.json(userResult);
	    });
	});
};


exports.insertInternalCallUser = function() {
	var id = mongoose.Types.ObjectId(auth.INTERNAL_USER_ID);
	var query = { _id: id };
	User.findOne(query, function(err, user) {
	    if (err) return next(err);
	    if (!user)  {
	    	console.log("Creating internal/admin user");
	    	var newUser = new User({
	    		_id: id,
	    		name: "root",
	    		password: "does not matter because user is deactivated",
	    		deactivated: true,
	    		role: "internal"
	    	});
	    	newUser.save(function(err, userResult) {
		    	if(err) console.log("ERROR: Could not save user!"); // TODO handle this error
		    });
	    };
	});
}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
