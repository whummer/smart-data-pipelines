'use strict';

var config = require('../config');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var riox = require('riox-shared/lib/api/riox-api');
var log = global.log || require('winston');
var LRUCache = require("lru-cache");

var validateJwt = expressJwt({secret: config.secrets.session});

var INTERNAL_USER_ID = "000000000000000000000000"; // Mongodb ObjectId format
var expiresInMinutes = 60 * 24 * 3; // 3 days expiration time

var usersCache = LRUCache({
	max: 500,
	maxAge: 1000 * 60
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {

	return compose()
		// Validate jwt
		.use(function (req, res, next) {
			// allow access_token to be passed through query parameter as well
			if (req.query && req.query.hasOwnProperty('access_token')) {
				var header = getHeaderFromToken(req.query.access_token);
				req.headers.authorization = header.authorization;
			}
			// allow access_token to be passed through cookie header as well
			if (req.cookies && req.cookies['token']) {
				var token = req.cookies['token'];
				if(token.slice(0, 1) == '"') token = token.substring(1);
				if(token.slice(-1) == '"') token = token.substring(0, token.length - 1);
				var header = getHeaderFromToken(token);
				req.headers.authorization = header.authorization;
			}
			validateJwt(req, res, next);
		})
		.use(function (err, req, res, next) {
			if(err)
				res.status(401).send({error: "Unauthorized: " + err}); // set Unauthorized status code
			next(err);
		});
}

function userHasRole(user, role) {
	return config.userRoles.indexOf(user.role) >= 
		config.userRoles.indexOf(role);
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
	if (!roleRequired) throw new Error('Required role needs to be set');

	return compose()
		.use(isAuthenticated())
		.use(function meetsRequirements(req, res, next) {
			var id = req.user._id;
			var check = function () {
				if (userHasRole(req.user, roleRequired)) {
					next();
				}
				else {
					res.status(403).json({error: "Forbidden."});
					res.end();
				}
			}
			var cachedUser = usersCache.get(id);
			if (req.user.role) {
				check();
			} else if (cachedUser) {
				req.user.role = cachedUser.role;
				check();
			} else {
				riox.user({id: id}, {
					headers: req.headers,
					callback: function (user) {
						/* add user role to request */
						req.user.role = user.role;
						usersCache.set(id, user);
						check();
					}
				});
			}
		});
}

/**
 * Fetches the organization memberships of the requesting user.
 */
function fetchOrgs() {

	return compose()
		.use(isAuthenticated())
		.use(function meetsRequirements(req, res, next) {
			if (!req.user.organizations) {
				riox.organizations({
					headers: req.headers,
					callback: function (orgs) {
						/* add user organizations to request */
						req.user.organizations = orgs || [];
						if(!orgs) {
							log.warn("Unable to get user organizations:", orgs);
						}
						/* add convenience functions.
						 * TODO wh: performance could be improved: don't
						 * always create these functions on the fly */
						req.user.hasOrganization = function (org) {
							var id = org.id ? org.id : org;
							var found = false;
							this.organizations.forEach(function (o1) {
								if (o1.id == id) found = true;
							});
							return found;
						};
						req.user.getOrganizationIDs = function (org) {
							var result = [];
							this.organizations.forEach(function (o1) {
								result.push(o1.id);
							});
							return result;
						};
						req.user.getDefaultOrganization = function () {
							var result = null;
							this.organizations.forEach(function (org) {
								if (org[CREATOR_ID] == user.id) result = org;
							});
							return result;
						};
						next();
					}
				}, function () {
					res.send(500);
					res.end();
				});
			}
		});
}

/**
 * Gets the current user of this request.
 */
function getCurrentUser(req) {
	var user = req.user;
	if (user._id && !user.id) {
		user.id = user._id;
	}
	return user;
}

/**
 * Gets details of the current user of this request.
 */
function getCurrentUserDetails(req, callback) {
	var user = getCurrentUser(req);
	riox.user({id: user.id}, {
		headers: req.headers,
		callback: callback
	});
}

function getInternalCallTokenHeader() {
	return getTokenHeaderForUserId(INTERNAL_USER_ID);
}

/**
 * Extract the user ID from the token of a request.
 */
function extractUserID(req, callback) {
	var token = getTokenFromHeaders(req);
	if(!token) {
		return callback(token);
	}
	return jwt.verify(token, config.secrets.session, callback);
}

/**
 * Validate a token
 */
function validateToken(token, callback) {
	return jwt.verify(token, config.secrets.session, callback);
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(userId) {
	return jwt.sign({_id: userId}, config.secrets.session,
		{expiresInMinutes: expiresInMinutes});
}

function getTokenHeaderForUserId(userId) {
	return getHeaderFromToken(signToken(userId));
}

function getHeaderFromToken(token) {
	return {authorization: 'Bearer ' + token};
}

function getTokenFromHeaders(req) {
	var authToken = req.headers.authorization;
	if(!authToken) return null;
	return authToken.split(/Bearer\s+/).slice(-1)[0];
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
	if (!req.user) {
		res.json(404, {message: 'Something went wrong, please try again.'});
		return res.end();
	}
	var token = signToken(req.user._id, req.user.role);
	res.cookie('token', JSON.stringify(token));
	res.redirect('/');
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.fetchOrgs = fetchOrgs;
exports.setTokenCookie = setTokenCookie;
exports.getCurrentUser = getCurrentUser;
exports.getCurrentUserDetails = getCurrentUserDetails;

exports.getInternalCallTokenHeader = getInternalCallTokenHeader;
exports.getTokenHeaderForUserId = getTokenHeaderForUserId;
exports.signToken = signToken;
exports.getHeaderFromToken = getHeaderFromToken;
exports.validateToken = validateToken;
exports.extractUserID = extractUserID;

exports.INTERNAL_USER_ID = INTERNAL_USER_ID;

