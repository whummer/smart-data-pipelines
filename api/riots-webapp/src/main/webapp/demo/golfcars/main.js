var GEO_FENCE = "riots.geo.fence";

/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}


/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

var app = angular.module('demo', []);
app.controller('MainCtrl', function ($scope) {

	$scope.diameter = 100;

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

	var setMarker = function(thing) {
		var lat = thing.properties["location.latitude"];
		var lng = thing.properties["location.longitude"];
		if(!lat || !lng) return;
		if(!thing.marker) {
			var options = {};
			thing.marker = L.marker([lat, lng], options).
				bindPopup(thing.name);
			$scope.map.addLayer(thing.marker);
		}
		thing.marker.setLatLng([lat, lng]);
	}

	var subscribeProp = function(thing, propName) {
		riots.subscribe({
			thingId: thing.id,
			propertyName: propName
		}, function(data) {
			console.log(propName, data);
			$scope.$apply(function() {
				if(propName == GEO_FENCE) {
					if(!thing.properties[propName]) {
						thing.properties[propName] = {}
					}
					$.extend(thing.properties[propName], data.value);
				} else {
					thing.properties[propName] = data.value;
					setMarker(thing);
				}
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
					subscribeProp(thing, GEO_FENCE);
					riots.thingType(thing[THING_TYPE], function(thingType) {
						$scope.$apply(function() {
							thing.img = thingType[IMAGE_URLS][0];
						});
						//console.log(thingType, thing.img, thing.name);
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
		$scope.geoFence = {
			center: {
				latitude: center.lat,
				longitude: center.lng
			},
			diameter: $scope.diameter
		};
		riots.util.addGeoFence($scope.geoFence, function(fence) {
			$scope.$apply(function() {
				$scope.geoFence = fence;
			});
			var loc = [fence.center.latitude, fence.center.longitude];
			if(!$scope.currentDiameter) {
				$scope.currentDiameter = L.circle(loc, fence.diameter);
				$scope.currentDiameter.addTo($scope.map);
			} else {
				$scope.currentDiameter.setLatLng(loc);
				$scope.currentDiameter.setRadius(fence.diameter);
			}
		});
	}

	$scope.loadThings();
	setupMap();
});
