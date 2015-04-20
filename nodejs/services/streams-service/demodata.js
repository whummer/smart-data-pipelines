var DataStream = require('./api/streams/datastream.model');
var orgsClient = require('_/api/organizations.client');
var usersClient = require('_/api/users.client');

var LOREM = " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
var demoData = [
	{
		name : "Traffic Lights",
		description : "This data stream contains live "
				+ "updates of traffic lights." + LOREM,
		"organization-id" : 0,
		pricing : {
			billingUnit: "day",
			unitSize: 1,
			unitPrice: 123.4
		},
		permit : {
			type : "manual"
		}
	},
	{
		name : "Car Data",
		description : "This data stream contains live vehicle data, "
				+ "including location, fuel level." + LOREM,
		"organization-id" : 1,
		pricing : {
			billingUnit: "day",
			unitSize: 1,
			unitPrice: 0.0012
		},
		permit : {
			type : "manual"
		}
	},
	{
		name : "Temperature Values",
		description : "Live temperature updates of various locations in "
				+ "Vienna, Austria." + LOREM,
		"organization-id" : 0,
		pricing : {
			billingUnit: "free"
		},
		permit : {
			type : "manual"
		}
	},
	{
		name : "Incidents",
		description : "This data stream contains live incidents "
				+ "for the City of Vienna." + LOREM,
		"organization-id" : 0,
		pricing : {
			billingUnit: "free"
		},
		permit : {
			type : "auto"
		}
	},
	{
		name : "Car Data",
		description : "This data stream contains live vehicle data, "
				+ "including location, fuel level." + LOREM,
		"organization-id" : 2,
		pricing : {
			billingUnit: "event",
			unitSize: 1,
			unitPrice: 0.0025
		},
		permit : {
			type : "auto"
		}
	},
	{
		name : "Car Data",
		description : "This data stream contains live vehicle data, "
				+ "including location, fuel level." + LOREM,
		"organization-id" : 1,
		pricing : {
			billingUnit: "event",
			unitSize: 1,
			unitPrice: 0.0018
		},
		permit : {
			type : "auto"
		}
	},
	{
		name : "Car Data",
		description : "This data stream contains live vehicle data, "
				+ "including location, fuel level." + LOREM,
		"organization-id" : 3,
		pricing : {
			billingUnit: "event",
			unitSize: 1,
			unitPrice: 0.0012
		},
		permit : {
			type : "auto"
		}
	},
	{
		name : "Smart Building Data",
		description : "This data stream contains Smart Building Data",
		"organization-id" : 0,
		pricing : {
			billingUnit: "event",
			unitSize: 1,
			unitPrice: 0.0018
		},
		permit : {
			type : "auto"
		}
	} ];

function insertStreams() {
	demoData.forEach(function(el) {
		var org = orgs[el["organization-id"]];
		//console.log("org", org, org.id, org._id);
		el["organization-id"] = orgs[el["organization-id"]]._id;
		var newObj = new DataStream(el);
		newObj.save();
	});
}

var token = null;
var orgs = [];

function findOrgs(callback) {
	usersClient.auth(global.adminUser, {}, function(tok) {
		token = {authorization: "Bearer " + tok.token};
		orgsClient.list({headers: token}, function(list) {
			list.forEach(function(o) {
				index = o.name == "City of Vienna" ? 0 : 
						o.name == "BMW" ? 1 : 
						o.name == "Mercedes" ? 2 : 3; 
				orgs[index] = o;
			});
			callback();
		});
	});
}


setTimeout(function() {
	DataStream.find({}, function(err, list) {
		if (!list || !list.length) {
			findOrgs(insertStreams);
		}
	});
}, 1000);