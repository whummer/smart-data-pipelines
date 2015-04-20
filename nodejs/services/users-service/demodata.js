var Organization = require('./api/organizations/organization.model');
var User = require('_/model/user.model');

var demoData = [
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


Organization.find({}, function(err, list) {
	if (!list || !list.length) {
		demoData.forEach(function(el) {
			var newObj = new Organization(el);
			newObj.save();
		});
	}
});

User.find({email: adminUser.email}, function(err, list) {
	if (!list || !list.length) {
		var admin = new User(adminUser);
		admin.save();
	}
});

