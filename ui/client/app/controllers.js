
function catalogCtrl($scope, $log, $http) {
	$log.debug("Inside Catalog Controller");

	// Simple GET request example :
	$http.get('http://localhost:8080/resources').
			success(function (data, status, headers, config) {
				$log.debug("Loaded " + data.length + " resources from mongo");
				$scope.dataResources = data;
			}).
			error(function (data, status, headers, config) {
				$log.error("Could not load resources from mongo. Status code: " + status + ". Additional Info: ", data)
			});

	/*	$scope.dataResources = [
	 {
	 name : 'BMW Connected Drive',
	 description : 'Telemetry data about BMW connected cars',
	 price : '32',
	 logo : 'bmw.png'
	 },
	 {
	 name : 'Mercedes-Benz Commander Data',
	 description : 'Telemetry data about Mercedes connected cars',
	 price : '34',
	 logo : 'mercedes.gif'
	 },
	 {
	 name : 'Toyota',
	 description : 'Connected car data by Totyota',
	 price : '35',
	 logo : 'toyota.png'
	 }
	 ]*/
	;


}

function providerWizardCtrl($scope, $log, $http, growl, $state) {
	$scope.resourceData = {};

	$scope.retentionEnabled = false;
	$scope.retentionDisabled = false;

	/*$scope.securityEnabled = false;
	 $scope.securityDisabled = false;*/

	if ($state.params.debug) {
		$scope.debug = true;
	}

	$scope.connectors = [
		{name: "HTTP Connector"},
		{name: "AMQP Connector"},
		{name: "JMS Connector"},
		{name: "MQTT Connector"},
		{name: "SMTP Connector"},
		{name: "TCP Connector"}
	];

	/*$scope.updateRetentionEnabled = function(retentionEnabled) {
	 $log.debug("Retention enabled: ", retentionEnabled);
	 $scope.retentionDisabled = !retentionEnabled;
	 };

	 $scope.updateRetentionDisabled = function(retentionDisabled) {
	 $log.debug("Retention disabled: ", retentionDisabled);
	 $scope.retentionEnabled = !retentionDisabled;
	 };
	 */

	/*$scope.$watch("retentionDisabled", function(retentionDisabled){
	 $log.debug("Switching retentionDisabled to ", retentionDisabled);
	 if (retentionDisabled) {
	 $scope.retentionEnabled = !retentionDisabled;
	 }
	 });*/

	/*$scope.$watch("retentionEnabled", function(retentionEnabled){
	 $log.debug("Switching retentionEnabled to ", retentionEnabled);
	 if (retentionEnabled) {
	 $scope.retentionDisabled = !retentionEnabled;
	 } else {
	 $log.debug("Retention is disabled")
	 }
	 });*/

	$scope.$watch("logo", function () {
		$log.debug("Some logo: ", $scope.logo);
	});

	$scope.retentionTimeSliderOptions = {
		values: [
			"1 Hour", "24 Hours", "3 Days",
			"1 Week", "2 Weeks", "1 Month",
			"3 Months", "6 Months", "1 Year",
		],
		type: 'single',
		hasGrid: true
	};

	$scope.securitySliderOptions = {
		values: [
			"Inbound TLS", "Inbound & Outbound TLS", " Encryption: 3DES",
			"Encryption: RSA-2048"
		],
		type: 'single',
		hasGrid: true
	};

	$scope.processForm = function () {
		$log.debug("Saving new resource: ", $scope.resourceData);
		$http.post('http://localhost:8080/resources', $scope.resourceData)
				.success(function (data, status, headers) {
					$log.info("Created new resource at '%s'", headers.location);
					growl.success("Successfully created new resource");
				})
				.error(function (data, status) {
					$log.error("Could not create resource: %s", data);
				});
	};
}

function consumerWizardCtrl($scope) {
	$scope.resourceData = {};
	$scope.formData = {};
	$scope.processForm = function () {
		alert('Wizard completed');
	};
	$scope.trim = window.trim;

	// TODO remove
	var LOREM = " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";

	$scope.streams = [
	   	           {id: 1, name: "Traffic Lights", description: "This data stream contains live " +
	   	           		"updates of traffic lights." + LOREM,
	   	        	   organizationImg: "img/provider-logos/smart_city_wien.png", organizationName: "City of Vienna",
	   	        	   price: {type: "per_day", amount: 123.4}, permit: {type: "auto"}
	   	           },
		           {id: 2, name: "Car Data", description: "This data stream contains live vehicle data, " +
		           		"including location, fuel level." + LOREM,
	   	        	   organizationImg: "img/provider-logos/bmw.png", organizationName: "BMW",
	   	        	   price: {type: "per_event", amount: 0.0012}, permit: {type: "manual"}
	   	           },
		           {id: 3, name: "Temperature Values", description: "Live temperature updates of various locations in " +
		           		"Vienna, Austria." + LOREM,
	   	        	   organizationImg: "img/provider-logos/smart_city_wien.png", organizationName: "City of Vienna",
	   	        	   price: {type: "free"}, permit: {type: "auto"}
	   	           },
		           {id: 4, name: "Incidents", description: "This data stream contains live incidents " +
		           		"for the City of Vienna." + LOREM,
		   	        	   organizationImg: "img/provider-logos/smart_city_wien.png", organizationName: "City of Vienna",
		   	        	   price: {type: "free"}, permit: {type: "auto"}
	   	           },
		           {id: 5, name: "Car Data", description: "This data stream contains live vehicle data, " +
		           		"including location, fuel level." + LOREM,
	   	        	   organizationImg: "img/provider-logos/tesla.png", organizationName: "TESLA",
	   	        	   price: {type: "per_event", amount: 0.0025}, permit: {type: "auto"}
	   	           },
		           {id: 6, name: "Car Data", description: "This data stream contains live vehicle data, " +
		           		"including location, fuel level." + LOREM,
	   	        	   organizationImg: "img/provider-logos/mercedes.gif", organizationName: "Mercedes",
	   	        	   price: {type: "per_event", amount: 0.0018}, permit: {type: "auto"}
	   	           },
		           {id: 7, name: "Car Data", description: "This data stream contains live vehicle data, " +
		           		"including location, fuel level." + LOREM,
	   	        	   organizationImg: "img/provider-logos/toyota.png", organizationName: "Toyota",
	   	        	   price: {type: "per_event", amount: 0.0018}, permit: {type: "auto"}
	   	           },
		           {id: 8, name: "Smart Building Data", description: "This data stream contains " +
		           		"live about smart buildings." + LOREM, 
		           		organizationImg: "img/provider-logos/energieeffizienz.jpg", organizationName: "Energieeffizienz",
		           		price: {type: "on_request", amount: 0.0018}, permit: {type: "auto"}
	   	           }
	];

	$scope.producersAutocomp = {
		options: {
			html: true,
			focusOpen: true,
			valueList: [
					{id: 1, label: "BMW"},
					{id: 2, label: "Volkswagen"},
					{id: 3, label: "Smart City Vienna"}
			],
			source: function (request, response) {
				console.log(request);
				response($scope.producersAutocomp.options.valueList);
			}
		}
	};

	$scope.requestAccess = function() {
		if(!$scope.formData.streamAccess) {
			$scope.formData.streamAccess = {};
			$scope.loadAccessStatus(function() {
				$scope.formData.streamAccess.status = "requested";
			});
		} else {
			$scope.formData.streamAccess.status = "requested";
		}
	};

	$scope.loadAccessStatus = function(callback) {
		var query = {
			streamId: $scope.formData.selectedStream.id
		};
		riox.access(query, function(access) {
			$scope.formData.streamAccess = access;
			if(callback) {
				callback();
			}
		});
	};
}

function dashboardCtrl($scope, $log) {
	$scope.dashboard = {
		map: {
			data: {
				"US": 293,
				"FR": 540,
				"CH": 120,
				"AT": 10,
				"DE": 550,
				"IT": 200,
				"GB": 120
			}
		},

		consumers: [
			{idx: 1, name: 'Landzeit', consumed: 12313412, amount: 'EUR 1239,32.-'},
			{idx: 2, name: 'OMV', consumed: 661312, amount: 'EUR 529,29.-'},
			{idx: 3, name: 'McDonalds', consumed: 123112, amount: 'EUR 421,17.-'},
			{idx: 4, name: 'Moser Medical Group', consumed: 3813, amount: 'EUR 189,15.-'},
			{idx: 5, name: 'VIG (Vienna Insurance Group)', consumed: 3412, amount: 'EUR 139,12.-'}
		]

	};

	$scope.sortableOptions = {
		connectWith: ".connectPanels",
		handler: ".ibox-title"
	};


}

function footerCtrl($scope, $interval) {
	$interval(function () {
		$scope.consumerCounter = getRandomInt(38000, 40000);
		$scope.providerCounter = getRandomInt(2800, 2805);
	}, 1000);
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


var app = angular.module('rioxApp');
app.controller('providerWizardCtrl', providerWizardCtrl)
		.controller('consumerWizardCtrl', consumerWizardCtrl)
		.controller('catalogCtrl', catalogCtrl)
		.controller('footerCtrl', footerCtrl)
		.controller('dashboardCtrl', dashboardCtrl);
