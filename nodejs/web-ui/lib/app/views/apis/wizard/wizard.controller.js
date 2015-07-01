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

	$scope.connectors = $scope.availableConnectors;

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

	var createNewCertificate = function() {
		var deferred = $q.defer();
		if($scope.resourceData.securityEnabled && 
				$scope.resourceData.certSelect &&
				$scope.resourceData.certSelect.id == '__new__') {
			var cert = {};
			cert[CERT_FILE] = $scope.resourceData.certCRT;
			cert[PK_FILE] = $scope.resourceData.certKEY;
			cert[NAME] = $scope.resourceData.certName;
			riox.add.certificate(cert, function(savedCert){
				$scope.resourceData.certSelect = savedCert;
				deferred.resolve(savedCert);
			});
		} else {
			deferred.resolve();
		}
		return deferred.promise;
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
		var selectedOrganization = null;

		var addStreamSource = function (selectedOrganization) {
			$log.debug("Saving new resource: ", r);

			var connector = {};
			connector[TYPE] = r.connector.type;
			connector[CERTIFICATE] = !$scope.resourceData.securityEnabled ? 
					"default" : $scope.resourceData.certSelect.id;
	
			var dataStream = {};
			dataStream[NAME] = r.name;
			dataStream[DESCRIPTION] = r.description;
			dataStream[CONNECTOR] = connector;
			dataStream[ORGANIZATION_ID] = "TODO"; // default org. filled in a later function call; 
												// TODO: however, should be made configurable in wizard 
			dataStream[TAGS] = r.tags;
			dataStream[VISIBLE] = true;
	
			var selectedPermitMode = r.authDisabled ? PERMIT_MODE_AUTO : PERMIT_MODE_MANUAL;
			dataStream[PERMIT_MODE] = {
				type : selectedPermitMode
			};

			// todo billingUnit and unitSize are currently not used
			if (dataItems.length) {
				dataStream[DATA_ITEMS] = dataItems;
			} else {
				dataStream.pricing = {
					unitPrice: r.defaultPricing
				};
			};

			dataStream[ORGANIZATION_ID] = selectedOrganization.id;
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

		// add certificate, then determine the organization of the logged in user, then create the stream
		createNewCertificate().
			then($scope.loadDefaultOrganization).
			then(addStreamSource, handleDefaultOrgUnavailable);
	}

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.apis.wizard.basic", name: "Wizard" };
	}
	$scope.setNavPath($scope, $state);
	
});
