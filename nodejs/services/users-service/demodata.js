var Organization = require('./api/organizations/organization.model');
var User = require('./api/users/user.model');
var Activation = require('./api/users/activation.model');
var Membership = require('./api/organizations/membership.model');

var demoOrgs = [
    	{
    		_id : "000000000001",
    		domain : ["platform", "web4d.ftp.sh", "gateway." + global.config.domain],
    		name : "Riox",
    		description : "This organization represents the Riox platform tenant.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/riox.png"
    		}]
    	},{
    		_id : "000000000002",
    		domain : "vienna",
    		name : "City of Vienna",
    		description : "This organization represents the City of Vienna.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/smart_city_wien.png"
    		}]
    	},{
    		_id : "000000000003",
    		domain : "bmw",
    		name : "BMW",
    		description : "This is the BMW organization.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/bmw.png"
    		}]
    	},{
    		_id : "000000000004",
    		domain : "mercedes",
    		name : "Mercedes",
    		description : "This is Mercedes Benz.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/mercedes.png"
    		}]
    	},
    	{
    		_id: "000000000005",
    		domain : "tesla",
    		name : "Tesla",
    		description : "Tesla Car Company.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/tesla.png",
    		}]
    	}
];

var demoUsers = [
     	{
    		name: "W.H.",
    		email: "wh@riox.io",
    		password: "test123",
    		role: "admin",
    		orgs: [ "000000000001" ]
    	},{
    		name: "F.R.",
    		email: "om@riox.io",
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
    		name: "Walde",
    		email: "wh1@riox.io",
    		password: "test123"
    	},
    	adminUser
];


Organization.find({}, function(err, list) {
	if(err) {
		console.error(err);
		return;
	}
	if (!list || !list.length) {
		demoOrgs.forEach(function(el) {
			var newObj = new Organization(el);
			newObj.save();
		});
	}
});

demoUsers.forEach(function(user) {
	var query = {
			email: user.email
	};
	var orgs = user.orgs;
	delete user.orgs;
	User.find(query, function(err, list) {
		if(err) {
			console.error(err);
			return;
		}
		if (!list || !list.length) {
			var userObj = new User(user);
			userObj.save(function(err, user) {
				var act = {};
				act[USER_ID] = user.id;
				act[ACTIVATION_DATE] = new Date();
				var actObj = new Activation(act);
				actObj.save();
				if(orgs) {
					orgs.forEach(function(org) {
						var mem = new Membership();
						mem[ORGANIZATION_ID] = org;
						mem[MEMBER] = user[ID];
						mem[STATUS] = STATUS_CONFIRMED;
						mem[CREATION_DATE] = new Date();
						mem.save();
					});
				}
			});
		}
	});
});
