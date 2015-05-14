'use strict';

angular.module('rioxApp').controller('DriverCtrl', function ($scope, $stateParams) {

	/* hardcoded ID, e.g., vehicle ID */
	var driverId = "56b5b2ae-f8bd-11e4-a322-1697f925ec7b";
	/* the stream source to push the date to */
	$scope.streamSource = null;
	/* location */
	var location = {
			latitude: $scope.mapCenter.lat,
			longitude: $scope.mapCenter.lng
	};

	/* user signin */
	var testUser = { email: "wh@riox.io", password: "test123" };
	var signin = function() {
		riox.signin(testUser, function(token) {
			testUser.token = token;
		});
	}
	signin();


	var pollData = function() {
		$scope.__polling = true;
		loadRequests();
		loadSources();
		setTimeout(pollData, 2000);
	};

	var pushData = function() {
		$scope.__pushing = true;
		transmitData();
		setTimeout(pushData, 1000);
	};

	var transmitData = function() {
		if(!$scope.streamSource) {
			return;
		}
		var url = $scope.streamSource.endpoint;
		console.log("Transmitting to ", url);
		location.latitude += (0.5 - Math.random()) * 0.001;
		location.longitude += (0.5 - Math.random()) * 0.001;
		var payload = {driverId: driverId,
				location: location
		};
		$.post(url, JSON.stringify(payload));
	}

	var loadSources = function() {
		if($scope.streamSource) {
			return;
		}
		if(!testUser.token) return;
		var query = {};
		query[NAME] = "demo";
		riox.streams.provided(query, function(streams) {
			console.log(streams);
			if(!$scope.streamSource && streams.length) {
				$scope.streamSource = streams[0];
			}
		});
	};

	var loadRequests = function() {
		$scope.consents = [];
		var request = {
			consumer: "McDonalds",
			service: "Customer App",
			data: ["Location",
			       "Fuel Level",
			       "Battery Level",
			       "Driving Time"
			],
			status: STATUS_REQUESTED
		};
		var query = {};
		query[CONSENTOR_ID] = driverId;
		riox.consents(query, function(consents) {
			if(!consents.length && !window.__testAdded) {
				window.__testAdded = true;
				//consents.push(request); // TODO for testing
			}
			if(!$scope.request) {
				consents.forEach(function(cons) {
					if(cons[STATUS] == STATUS_REQUESTED) {
						$scope.$apply(function() {
							$scope.request = cons;
						});
						loadDetails(cons);
					}
				});
			}
			$scope.consents = consents;
		});
	};

	/* load details of a consent request */
	var loadDetails = function(cons) {
		if(cons[REQUESTOR_ID]) {
			riox.organization(cons[REQUESTOR_ID], function(org) {
				cons.consumer = org;
			});
		}
		if(cons[SOURCE_ID]) {
			riox.streams.source(cons[SOURCE_ID], function(source) {
				cons.data = source.dataItems; // TODO
			});
		}
		cons.service = "Customer App"; // TODO
	};

	$scope.accept = function() {
		riox.consent.enable($scope.request, function() {
			$scope.request = null;
		});
	};

	$scope.deny = function() {
		riox.consent.disable($scope.request, function() {
			$scope.request = null;
		});
	};

	if(!$scope.__polling) {
		pollData();
	}
	if(!$scope.__pushing) {
		pushData();
	}

});
