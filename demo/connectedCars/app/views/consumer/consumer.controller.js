'use strict';

angular.module('rioxApp').controller('ConsumerCtrl',
function($scope, $stateParams) {

	$scope.markers = [];

	/* user signin */
	var testUser = { email: "wh@riox.io", password: "test123" };
	var signin = function() {
		riox.signin(testUser, function(token) {
			testUser.token = token;
		});
	}
	signin();

	var setMarker = function(thing) {
		var marker = false;
		$scope.markers.forEach(function(m) {
			if(m.id == thing.driverId) marker = m;
		});
		if(!marker) {
			marker = {
				id: thing.driverId,
                message: thing.driverId
            };
			$scope.markers.push(marker);
		}
        $scope.$apply(function() {
        	marker.lat = thing.location.latitude;
        	marker.lng = thing.location.longitude;
        });
    };

	var pollData = function() {
		$scope.__polling = true;
		loadSinks();
		setTimeout(pollData, 2000);
	};

	var loadSinks = function() {
		if($scope.streamSink) {
			//console.log($scope.streamSink);
			return;
		}
		if(!testUser.token) return;
		var query = {};
		riox.streams.sinks(query, function(sinks) {
			console.log(sinks);
			if(!$scope.streamSink && sinks.length) {
				$scope.streamSink = sinks[0];
				subscribe();
			}
		});
	};

	var subscribe = function() {
		var url = $scope.streamSink.endpoint;
		console.log("connectWebsocket", url);
		var ws = riox.connectWebsocket({
			url: url
		});
		ws.onmessage = function (msg) {
			var data = JSON.parse(msg.data);
			console.log(data);
			setMarker(data);
		}
	}

	if(!$scope.__polling) {
		pollData();
	}
});
