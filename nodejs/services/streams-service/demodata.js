var StreamSource = require('./api/streams/streamsource.model.js');
var riox = require('riox-shared/lib/api/riox-api');
var riox = require('riox-shared/lib/api/riox-api-admin')(riox);


var LOREM = " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
var demoData = [
	{
		name : "Traffic Lights",
		description : "This data stream contains live "
				+ "updates of traffic lights." + LOREM,
		"organization-id" : 1,
		pricing : {
			billingUnit: "day",
			unitSize: 1,
			unitPrice: 123.4
		},
		permit : {
			type : PERMIT_MODE_MANUAL
		}
	},
	{
		name : "Car Data",
		description : "This data stream contains live vehicle data, "
				+ "including location, fuel level." + LOREM,
		"organization-id" : 2,
		pricing : {
			billingUnit: "day",
			unitSize: 1,
			unitPrice: 0.0012
		},
		permit : {
			type : PERMIT_MODE_MANUAL
		}
	},
	{
		name : "Temperature Values",
		description : "Live temperature updates of various locations in "
				+ "Vienna, Austria." + LOREM,
		"organization-id" : 1,
		pricing : {
			billingUnit: "free"
		},
		permit : {
			type : PERMIT_MODE_MANUAL
		}
	},
	{
		name : "Incidents",
		description : "This data stream contains live incidents "
				+ "for the City of Vienna." + LOREM,
		"organization-id" : 1,
		pricing : {
			billingUnit: "free"
		},
		permit : {
			type : PERMIT_MODE_AUTO
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
			unitPrice: 0.0025
		},
		permit : {
			type : PERMIT_MODE_AUTO
		}
	},
	{
		name : "Car Data",
		description : "This data stream contains live vehicle data, "
				+ "including location, fuel level." + LOREM,
		"organization-id" : 4,
		pricing : {
			billingUnit: "event",
			unitSize: 1,
			unitPrice: 0.0018
		},
		permit : {
			type : PERMIT_MODE_AUTO
		}
	},
	{
		name : "Smart Building Data",
		description : "This data stream contains Smart Building Data",
		"organization-id" : 1,
		pricing : {
			billingUnit: "event",
			unitSize: 1,
			unitPrice: 0.0018
		},
		permit : {
			type : PERMIT_MODE_AUTO
		}
	}
];

var rioxAPIs =
[
	{
		name: "Stream Sources",
		description: "Manage API Stream Sources",
		"organization-id" : 0,
		connector: {
			type: "http"
		},
		backends: ["http://127.0.0.1:8085"],
		"allow-cors": true,
		operations:
		[{
			"name": "Get list of stream sources",
			"http-method": "GET",
			"http-resource": "/api/v1/streams/sources"
		},{
			"name": "Get single stream source",
			"http-method": "GET",
			"http-resource": "/api/v1/streams/sources/*"
		},{
			"name": "Add stream source",
			"http-method": "POST",
			"http-resource": "/api/v1/streams/sources"
		},{
			"name": "Update stream source",
			"http-method": "PUT",
			"http-resource": "/api/v1/streams/sources"
		},{
			"name": "Delete stream source",
			"http-method": "DELETE",
			"http-resource": "/api/v1/streams/sources"
		}]
	},{
		name: "Organizations",
		description: "Manage Organizations",
		"organization-id" : 0,
		connector: {
			type: "http"
		},
		backends: ["http://127.0.0.1:8084"],
		"allow-cors": true,
		operations:
		[{
			"name": "Get list of organizations",
			"http-method": "GET",
			"http-resource": "/api/v1/organizations"
		},{
			"name": "Get single organization",
			"http-method": "GET",
			"http-resource": "/api/v1/organizations/*"
		},{
			"name": "Add organization",
			"http-method": "POST",
			"http-resource": "/api/v1/organizations"
		},{
			"name": "Update organization",
			"http-method": "PUT",
			"http-resource": "/api/v1/organizations"
		},{
			"name": "Delete organization",
			"http-method": "DELETE",
			"http-resource": "/api/v1/organizations/*"
		}]
	}
];

demoData = demoData.concat(rioxAPIs);

function insertStreamSources() {
	demoData.forEach(function(el) {
		var org = orgs[el[ORGANIZATION_ID]];
		//console.log("org", org, org.id, org._id);
		el[ORGANIZATION_ID] = orgs[el[ORGANIZATION_ID]]._id;
		var newObj = new StreamSource(el);
		newObj.save();
	});
}

var token = null;
var orgs = [];

function findOrgs(callback) {
	riox.signin(global.adminUser, function(tok) {
		token = {authorization: "Bearer " + tok.token};
		riox.organizations.all({
			headers: token,
			callback: function(list) {
				list.forEach(function(o) {
					index = o.domain == "platform" ? 0 :
							o.domain == "vienna" ? 1 :
							o.domain == "bmw" ? 2 :
							o.domain == "mercedes" ? 3 : 
							o.domain == "tesla" ? 4 : 5;
					orgs[index] = o;
				});
				callback();
			}
		});
	}, function(e) {
		console.log("ERROR", e);
	});
}

function doInsert(callback) {
	setTimeout(function() {
		StreamSource.find({}, function(err, list) {
			if (!list || !list.length) {
				findOrgs(function() {
					insertStreamSources();
					if(callback) callback();
				});
			}
		});
	}, 2000);
}

module.exports = doInsert;
