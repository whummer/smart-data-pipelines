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
	[{
		name: "riox:web-ui",
		description: "Manage the Web UI",
		"organization-id" : 0,
		connector: {
			type: "http"
		},
		backends: [ "http://127.0.0.1:8081"],
		"allow-cors": true,
		"public-access": true,
		operations:
		[{
			"name": "GET index HTML page",
			"http-method": "GET",
			"url-path": "/(($)|(index.html))"
		},{
			"name": "GET Web content",
			"http-method": "GET",
			"url-path": "/((favicon.ico)|(robots.txt)|(app/)|(bower_components/))(.*)",
			"disable-log": true
		}]
	},{
		name: "riox:websocket",
		description: "Connect to live data via Websockets",
		"organization-id" : 0,
		connector: {
			type: "ws"
		},
		backends: [ "ws://127.0.0.1:8085"],
		"allow-cors": true,
		operations:
		[{
			"name": "Connect",
			"url-path": "/(.*)"
		}]
	}];

var mapping = {
		"organizations": 8084,
		"streams": 8085,
		"billing": 8080,
		"users": {
			"port": 8084,
			"public-access": true
		},
		"statistics": 8085,
		"ratings": 8085,
		"access": 8085,
		"files": 8087,
		"notifications": 8084,
		"analytics": 8086,
		"consents": 8085,
		"certificates": 8084
};

for(var key in mapping) {
	var port = mapping[key][PORT] ? mapping[key][PORT] : mapping[key];
	var pubAccess = mapping[key][PUBLIC_ACCESS];

	var entry = {
		name: "riox:" + key,
		description: "Manage " + key + " in the riox API",
		"organization-id" : 0,
		connector: {
			type: "http"
		},
		backends: [ "http://127.0.0.1:" + port ],
		"allow-cors": true,
		"public-access": pubAccess,
		operations:
		[{
			"name": "GET " + key,
			"http-method": "GET",
			"url-path": "/api/v1/" + key + "(.*)"
		},{
			"name": "POST " + key,
			"http-method": "POST",
			"url-path": "/api/v1/" + key + "(.*)"
		},{
			"name": "PUT " + key,
			"http-method": "PUT",
			"url-path": "/api/v1/" + key + "(.*)"
		},{
			"name": "DELETE " + key,
			"http-method": "DELETE",
			"url-path": "/api/v1/" + key + "(.*)"
		}]
	};
	rioxAPIs.push(entry);
};

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
					index = o.domain.indexOf("platform") >= 0 ? 0 :
							o.domain.indexOf("vienna") >= 0 ? 1 :
							o.domain.indexOf("bmw") >= 0 ? 2 :
							o.domain.indexOf("mercedes") >= 0 ? 3 : 
							o.domain.indexOf("tesla") >= 0 ? 4 : 5;
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
