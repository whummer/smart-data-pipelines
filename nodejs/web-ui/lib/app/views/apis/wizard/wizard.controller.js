'use strict';

angular.module('rioxApp').controller('ApisWizardCtrl', function ($scope, $log, growl, $state, $location, $q) {

	/* initialize defaults */
	var r = $scope.resourceData = {}
	r[CONNECTOR] = {name: "HTTP Connector", type: "http"};
	r[PERMIT_MODE] = {type: PERMIT_MODE_MANUAL};
	$scope.retentionEnabled = false;
	$scope.retentionDisabled = false;

	/* wizard steps */
	$scope.steps = ['index.apis.wizard.basic',
	                'index.apis.wizard.connector',
	                'index.apis.wizard.security',
	                'index.apis.wizard.data_access',
	                'index.apis.wizard.data_items',
//	                'index.apis.wizard.data_pricing',
	                'index.apis.wizard.deployment'];

	$scope.nextStep = function(numSteps) {
		if(!numSteps) numSteps = 1;
		var idx = $scope.steps.indexOf($state.current.name);
		$state.go($scope.steps[idx + numSteps]);
	};
	$scope.prevStep = function() {
		var idx = $scope.steps.indexOf($state.current.name);
		$state.go($scope.steps[idx - 1]);
	};
	$scope.prevDisabled = function() {
		var idx = $scope.steps.indexOf($state.current.name);
		return idx < 1;
	};

	if ($state.params.debug) {
		$scope.debug = true;
	}

	$scope.connectors = [
 		{name: "HTTP Connector", type: "http"},
		{name: "Websocket Connector", type: "ws"},
		{name: "MQTT Connector", type: "mqtt"}
	];

	$scope.retentionTimeSliderOptions = {
		values: [
			"1 Hour", "24 Hours", "3 Days",
			"1 Week", "2 Weeks", "1 Month",
			"3 Months", "6 Months", "1 Year"
		],
		type: 'single',
		hasGrid: true,
		onChange: updateRetentionTime
	};

	function updateRetentionTime(slider) {
		var retentionTimes = [
			"1h", "24h", "3d", "1w", "2w", "1m", "3m", "6m", "1y"
		];

		var value = slider.from;
		$scope.resourceData.retentionTime = retentionTimes[value];
		$log.debug("Changed retention time to ", $scope.resourceData.retentionTime);
	}

	function updateSecuritySettings(slider) {
		var securitySettings = ["tls_in", "tls_in_out", "3des_full", "rsa_2048_full"];
		var value = slider.from;
		$scope.resourceData.securitySetting = securitySettings[value];
		$log.debug("Changed security settings to ", $scope.resourceData.securitySetting);

	}

	$scope.securitySliderOptions = {
		values: [
			"Inbound TLS", "Inbound & Outbound TLS", " Encryption: 3DES",
			"Encryption: RSA-2048"
		],
		type: 'single',
		hasGrid: true,
		onChange: updateSecuritySettings
	};

	//
	// "submits" the form, ie. creates the data resource via the streams API
	//
	$scope.processForm = function () {
		var r = $scope.resourceData;

		// todo find out wht the filter does not work
		//var dataItems = $filter('filter')(r.dataItems, {"enabled" : "true"});

		var dataItems = [];
		angular.forEach(r.dataItems, function (dataItem) {
			if (dataItem.enabled) {
				dataItems.push({name: dataItem.name, price: dataItem.price});
			}
		});

		$log.debug("Filtered data items: ", dataItems);
		$log.debug("Saving new resource: ", r);
		var dataStream = {
			"name": r.name,
			"description": r.description,
			"connector": {
				"type": r.connector.type // http, amqp, whatever
			},
			"organization-id": 'Default Organization',
			"tags": r.tags,
			"retention-time": r.retentionTime, // e.g. 3h, 2w, 1m, 1y
			"security": r.securitySetting, // TLS only, full
			"visible": true
		};

		var selectedPermitMode = r.authDisabled ? PERMIT_MODE_AUTO : PERMIT_MODE_MANUAL;
		dataStream[PERMIT_MODE] = {
			type : selectedPermitMode
		};

		// todo billingUnit and unitSize are currently not used
		if (dataItems.length) {
			dataStream["data-items"] = dataItems;
		} else {
			dataStream.pricing = {
				unitPrice: r.defaultPricing
			};
		}

		var addStreamSource = function (defaultOrganization) {
			dataStream[ORGANIZATION_ID] = defaultOrganization.id;
			$log.debug("Adding new data resource: ", dataStream);
			riox.add.streams.source(dataStream, function () {
				growl.success("Added new API '" + dataStream.name + "'");
				$state.go('index.apis.list');
			})
		};

		var handleDefaultOrgUnavailable = function (reason) {
			growl.error('Cannot load default organization: ' + reason);
			$log.error('Cannot load default orgaization: ' + reason);
		};

		// determine the organizatio of the logged in user, then create the stream
		$scope.loadDefaultOrganization().then(addStreamSource, handleDefaultOrgUnavailable);
	}

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.wizard.basic", name: "Wizard" };
	}
	$scope.setNavPath($scope);
	
});
