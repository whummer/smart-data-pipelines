'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var starters = require('./service.starters');

var app = {};
var services = {};

var attemptLogin = function(email, pass, callback) {
	var url = services.users.url + "/auth/local";
	superagent.post(url).send(
			{email: email, password: pass}
		).
		end(
		function(err, res) {
			if(err && err.status == 401) {
				registerUser(email, pass, callback);
				return;
			}
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			callback(res);
		});
}

var registerUser = function(email, pass, callback) {
	superagent.post(services.users.url).
		send(
			{name: email, email: email, password: pass}
		).
		end(
		function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			callback(res);
		});
}


var initClientProxy = function(proxy) {
	proxy.get = function(url) {
		return superagent.get(url)
			.set("authorization", proxy.tokenHeaders.authorization)
			.set('Content-Type', 'application/json');
	}
	proxy.post = function(url) {
		return superagent.post(url)
			.set("authorization", proxy.tokenHeaders.authorization)
			.set('Content-Type', 'application/json');
	}
	proxy.put = function(url) {
		return superagent.put(url)
			.set("authorization", proxy.tokenHeaders.authorization)
			.set('Content-Type', 'application/json');
	}
	proxy.head = function(url) {
		return superagent.head(url)
			.set("authorization",	proxy.tokenHeaders.authorization)
			.set('Content-Type', 'application/json');
	}
	proxy.delete = function(url) {
		return superagent.del(url)
			.set("authorization", proxy.tokenHeaders.authorization)
			.set('Content-Type', 'application/json');
	}
}

app.auth = function(email, pass, callback) {
	/* start services */
	services.users = starters.startUsersService();
	services.organizations = starters.startOrganizationsService();
	/* do login */
	setTimeout(function() {
		attemptLogin(email, pass, callback);
	}, 1000);
}

var getUserId = function(userObj, callback) {
	userObj.get(services.users.url + "/me").end(
		function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			userObj.user = res.body;
			callback(res);
		}
	);
};

var getUserOrgs = function(userObj, callback) {
	userObj.get(services.organizations.url + "/default").end(
		function(err, res) {
			assert.ifError(err);
			assert.equal(res.status, status.OK);
			userObj.orgs = { default: res.body };
			callback(res);
		}
	);
};

app.authDefault = function(callback) {
	if(app.user1 && app.user2) {
		if(callback) callback();
		return;
	}

	app.auth("test1@example.com", "test123", function(res) {
		app.user1 = {
			tokenHeaders : {
				authorization : "Bearer " + res.body.token
			}
		};
		initClientProxy(app.user1);

		app.auth("test2@example.com", "test123", function(res) {
			app.user2 = {
				tokenHeaders : {
					authorization : "Bearer " + res.body.token
				}
			};
			initClientProxy(app.user2);

			getUserId(app.user1, function() {
				getUserId(app.user2, function() {
					getUserOrgs(app.user1, function() {
						getUserOrgs(app.user2, function() {
							if(callback) callback();
						});
					});
				});
			});

		});
	});
}

module.exports = app;
