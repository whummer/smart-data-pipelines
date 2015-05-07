var Organization = require('./api/organizations/organization.model');
var User = require('./api/users/user.model');

var demoOrgs = [
    	{
    		id: "1",
    		name : "City of Vienna",
    		description : "This organization represents the City of Vienna.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/smart_city_wien.png",
    		}]
    	},
    	{
    		id: "2",
    		name : "BMW",
    		description : "This is the BMW organization.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/bmw.png",
    		}]
    	},
    	{
    		id: "3",
    		name : "Mercedes",
    		description : "This is Mercedes Benz.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/mercedes.png",
    		}]
    	},
    	{
    		id: "4",
    		name : "Tesla",
    		description : "Tesla Car Company.",
    		"image-data" : [{
    			href: "app/components/img/provider-logos/tesla.png",
    		}]
    	}
];

var demoUsers = [
    	{
    		name : "W.H.",
    		email : "wh@riox.io",
    		password : "test123"
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
	User.find(user.email, function(err, list) {
		if(err) {
			console.error(err);
			return;
		}
		if (!list || !list.length) {
			var userObj = new User(user);
			userObj.save();
		}
	});
});

