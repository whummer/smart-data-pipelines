var Organization = require('./organizations/organization.model');
var User = require('./users/user.model');
var Activation = require('./users/activation.model');
var Membership = require('./organizations/membership.model');

var initOrgs = [
    	{
    		_id : "000000000001",
    		domain : ["platform", "demo", "staging",
    		          "gateway.production.svc.cluster.local",
    		          "gateway.staging.svc.cluster.local",
    		          "gateway.test.svc.cluster.local",
    		          "gateway.development.svc.cluster.local"],
    		name : "Riox",
    		description : "This organization represents the Riox platform tenant.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/riox.png"
    		}]
    	}
];

var initUsers = [
     	{
    		name: "W.H.",
    		email: "wh@riox.io",
    		password: "test123",
    		role: "admin",
    		orgs: [ "000000000001" ]
    	},{
    		name: "O.M.",
    		email: "om@riox.io",
    		password: "test123",
    		role: "admin",
    		orgs: [ "000000000001" ]
    	},{
    		name: "test1",
    		email: "test1@example.com",
    		password: "test123",
    		role: "user",
    		orgs: [ ]
    	},{
    		name: "test2",
    		email: "test2@example.com",
    		password: "test123",
    		role: "user",
    		orgs: [ ]
    	},
    	adminUser
];

var logErrorAndReject = function(err, reject) {
	console.error(err);
	return reject(err);
}

var insertUsers = function(callback, errorCallback) {
	/* create wrapper promise */
	var promise = new Promise(function(resolve) {resolve()});

	initUsers.forEach(function(user) {
		var query = {
				email: user.email
		};
		var orgs = user.orgs;
		delete user.orgs;

		promise = promise.then(function() {
			return new Promise(function(resolve, reject) {
				User.find(query, function(err, list) {
					if(err)
						return logErrorAndReject(err, reject);

					if (!list || !list.length) {

						var userObj = new User(user);
						userObj.save(function(err, user) {
							if(err) {
								return logErrorAndReject(err, reject);
							}

							var act = {};
							act[USER_ID] = user.id;
							act[ACTIVATION_DATE] = new Date();
							var actObj = new Activation(act);
							actObj.save();

							var promiseInner = new Promise(function(resolve) {resolve()});

							if(orgs) {
								orgs.forEach(function(org) {
									promiseInner = promiseInner.then(function() {
										return new Promise(function(resolve, reject) {
											var mem = new Membership();
											mem[ORGANIZATION_ID] = org;
											mem[MEMBER] = user[ID];
											mem[STATUS] = STATUS_CONFIRMED;
											mem[CREATION_DATE] = new Date();
											mem.save(function(err, savedObj) {
												if(err)
													return logErrorAndReject(err, reject);

												resolve(savedObj);
											});
										});
									});
								});
							}

							promiseInner.then(resolve, reject);
						});
					} else {
						resolve(list);
					}
				});
			});
		});
	});

	promise.then(callback, errorCallback);
};

var insertOrgs = function(callback, errorCallback) {
	Organization.find({}, function(err, list) {
		if(err) {
			console.error(err);
			if(errorCallback) return errorCallback(err);
			else return callback(null);
		}
		if (!list || !list.length) {
			var promise = new Promise(function(resolve) {resolve()});
			initOrgs.forEach(function(el) {
				promise = promise.then(function() {
					return new Promise(function(resolve, reject) {
						var newObj = new Organization(el);
						newObj.save(function(err, savedObj) {
							if(err) return reject();
							return resolve();
						});
					});
				});
			});
			promise.then(callback, errorCallback);
		} else {
			callback();
		}
	});
};

var doInsert = function(callback, errorCallback) {
	insertOrgs(function() {
		insertUsers(function() {
			/* success */
			callback();
		}, errorCallback)
	}, errorCallback);
};

module.exports = doInsert;

module.exports.loopInsert = function() {
	console.log("Bootstrapping users metadata.");
	var timeout = 5000;
	var loop = function() {
		doInsert(function(success) {
			/* success */
		}, function(err) {
			console.log("Cannot boostrap users metadata. Retry-ing in ", timeout + "ms");
			/* error -> retry */
			setTimeout(loop, timeout);
		});
	}
	loop();
};

