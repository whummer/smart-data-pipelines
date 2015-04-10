function providerWizardCtrl($scope, $log, $http, growl, $state) {
	$scope.resourceData = {};

	$scope.retentionEnabled = false;
	$scope.retentionDisabled = false;

	/*$scope.securityEnabled = false;
	 $scope.securityDisabled = false;*/

	if ($state.params.debug) {
		$scope.debug = true;

	}

	$scope.debug = true;

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
		$http.post('/resources', $scope.resourceData)
				.success(function (data, status, headers) {
					$log.info("Created new resource at '%s'", headers.location);
					growl.success("Successfully created new resource");
				})
				.error(function (data, status) {
					$log.error("Could not create resource: %s", data);
				});
	};
}

angular.module('rioxApp').controller(providerWizardCtrl);