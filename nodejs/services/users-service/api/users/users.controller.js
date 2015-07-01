'use strict';

var User = require('./user.model');
var Activation = require('./activation.model');
var passport = require('passport');
var mongoose = global.mongoose || require('mongoose');
var config = require('../../config/environment');
var riox = require('riox-shared/lib/api/riox-api');
var auth = require('riox-services-base/lib/auth/auth.service');
var email = require('riox-services-base/lib/util/email');
var uuid = require('uuid');

/* configuration */
var PW_MIN_LENGTH = 6;

var validationError = function(res, err) {
  return customError(res, 422, err);
};
var customError = function(res, code, err) {
	if(!err.error) {
		err = {error: err};
	}
	return res.status(code).json(err);
};

/**
 * Authentication request
 */
exports.auth = function(req, res) {
	if(req.body.network == "riox" && req.body.token) {
		auth.validateToken(req.body.token, function(err, valid) {
			if(err) {
				return customError(res, 401, "Permission denied.");
			}
			return res.json(req.body);
		});
	} else {
		customError(res, 422, "Invalid auth details");
	}
};

exports.search = function(req, res) {
	var q = req.query.q;
	var email = req.query.email;
	var name = req.query.name;
	var query = {};

	if(email) {
		query[EMAIL] = email;
	} else if(name) {
		query[NAME] = name;
	} else if(!email) {
		var or1 = {};
		var or2 = {};
		or1[NAME] = q;
		or2[EMAIL] = q;
		var or = [or1, or2];
		query = {"$or" : or};
	}
	User.find(query, function(err, users) {
		if(err) {
			return customError(res, 500, "Error when searching for users.");
		}
		var result = [];
		users.forEach(function(user) {
			var u = {};
			u[ID] = user[ID];
			u[NAME] = user[NAME];
			u[EMAIL] = user[EMAIL];
			result.push(u);
		});
		return res.json(result);
	});
};

exports.activate = function(req, res) {
	var query = {};
	query[ACTIVATION_KEY] = req.body.activationKey;
	Activation.find(query, function(err, activation) {
		if (err || !activation) return validationError(res, err);
		activation = activation[0];
		activation[ACTIVATION_DATE] = new Date();
		activation.save(function(err, activation) {
			if (err || !activation) return validationError(res, err);
			return res.json({status: "Account activated."});
		});
	});
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return customError(res, 500, err);
    res.json(users);
  });
};

/** 
 * Send activation mail.
 */
var sendActivationMail = exports.sendActivationMail = function(user) {
	var activation = new Activation();
	activation[ACTIVATION_KEY] = uuid.v4();
	activation[USER_ID] = user[ID];
	activation[CREATION_DATE] = new Date();
	activation.save(function(err, activation) {
		if (err || !activation) return validationError(res, err);
		email.sendActivationMail(user, activation[ACTIVATION_KEY]);
	});
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
	var orgName = req.body.organization;
	delete req.body.organization;
	var newUser = new User(req.body);
	newUser.provider = 'local';
	newUser.role = 'user';
	if(!newUser[NAME]) {
		newUser[NAME] = newUser[FIRSTNAME] + " " + newUser[LASTNAME];
	}

	if(!checkPassword(newUser.password, res)) {
		return;
	}

	newUser.save(function(err, user) {
		if (err || !user) return validationError(res, err);

		var token = auth.signToken(user._id);
		var headers = auth.getHeaderFromToken(token);

		var org = {name: orgName};
		if(!org.name) org.name = "Default Organization";
		//var token = auth.getInternalCallToken();
		riox.add.organization(org, {
				callback: function(org) {
		 		/* send activation mail */
				sendActivationMail(user);
				/* send token result */
				res.json({ token: token });
			},
	    	headers: headers
		},
		function(error) {
			customError(res, 500, error);
		});
	});
};

/**
 * Get a single user.
 */
exports.show = function (req, res, next) {
	var userId = req.params.id;

	userId = new mongoose.Types.ObjectId(userId);

	/* TODO check permissions */
	User.findById(userId, function (err, user) {
		if (err) return next(err);
		if (!user) return res.send(404);
		res.json(user.profile);
	});
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
	User.findByIdAndRemove(req.params.id, function(err, user) {
		if(err) return customError(res, 500, err);
		return res.send(204);
	});
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
	var userId = req.user._id;
	var oldPass = String(req.body.oldPassword);
	var newPass = String(req.body.password);

	if(!checkPassword(newPass, res)) {
		return;
	}

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

var checkPassword = function(pass, res) {
	if(!checkPasswordValid(pass)) {
		res.send(422, {error: {
				errors: {
					password: {
						message: "The password contains illegal characters."
					}
				}
			}
		});
		return false;
	}
	if(!checkPasswordStrength(pass)) {
		res.send(422, {error: {
				errors: {
					password: {
						message: "Please use a sronger password: at least " + 
						PW_MIN_LENGTH + " characters (letters, numbers, specials)."
					}
				}
			}
		});
		return false;
	}
	return true;
};

var checkPasswordValid = function(pass) {
	return pass.match(/^[a-zA-Z0-9_!*\-@#+]+$/);
};

var checkPasswordStrength = function(pass) {
	/* TODO make configurable */
	return pass.match(/[a-zA-Z]+/) && 
		pass.match(/[0-9]+/) && 
		pass.length >= PW_MIN_LENGTH;
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
    if (!user) return res.status(401).send();
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
	    existingUser.name = newUser.name;

	    existingUser.save(function(err, userResult) {
	    	if(err) return res.send(401);
		    res.json(userResult);
	    });
	});
};


exports.insertInternalCallUser = function() {
	var id = new mongoose.Types.ObjectId(auth.INTERNAL_USER_ID);
	var query = { _id: id };
	User.findOne(query, function(err, user) {
	    if (err) return next(err);
	    if (!user)  {
	    	//console.log("Creating internal/admin user");
	    	var newUser = new User({
	    		_id: id,
	    		name: "root",
	    		password: "does_not_matter_because_user_is_deactivated",
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
