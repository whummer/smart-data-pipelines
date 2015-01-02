
var app = angular.module('demo', []);
app.controller('MainCtrl', function ($scope) {

	function setupMap() {
		var defaultLocation = [ 48.19742, 16.37127 ];
		$scope.map = L.map("worldMap", {
			"maxZoom": 23,
			"__markers": []
		}).
		setView(defaultLocation, 18).
		on("mouseup", function(e) {
			var newLoc = $scope.map.getCenter();
		});
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 23,
			maxNativeZoom: 19
		}).addTo($scope.map);
	}

	var subscribeProp = function(thing, propName) {
		riots.subscribe({
			thingId: thing.id,
			propertyName: propName
		}, function(data) {
			console.log(propName, data);
			$scope.$apply(function() {
				thing.properties[propName] = data.value;
			});
		});
	}

	$scope.loadThings = function() {
		riots.things(function(things) {
			$scope.$apply(function() {
				$scope.things = things;
			});
			var callback = function() {
				$.each(things, function(idx,thing) {
					thing.properties = {};
					subscribeProp(thing, "location.latitude");
					subscribeProp(thing, "location.longitude");
					riots.thingType(thing[THING_TYPE], function(thingType) {
						$scope.$apply(function() {
							thing.img = thingType[IMAGE_URLS][0];
						});
						console.log(thingType, thing.img, thing.name);
					});
				});
			}
			riots.unsubscribeAll(callback);
		});
	};

	$scope.setupGeoFence = function() {
		if($scope.geoFence && $scope.geoFence.id) {
			riots.util.removeGeoFence($scope.geoFence.id);
		}
		var center = $scope.map.getCenter();
		console.log(center);
		$scope.geoFence = {
			center: {
				latitude: center.lat,
				longitude: center.lng
			},
			diameter: 0.01
		};
		console.log($scope.geoFence);
		return;
		riots.util.addGeoFence($scope.geoFence, function(fence) {
			$scope.geoFence.id = fence.id;
		});
	}

	$scope.loadThings();
	setupMap();
});
