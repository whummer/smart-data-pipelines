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
	$scope.RIOTS_USER_ID = window.RIOTS_USER_ID;
	$scope.RIOTS_APP_KEY = window.RIOTS_APP_KEY;
	$scope.things = [];

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
			thing.marker = L.marker([lat, lng], options);
			$scope.map.addLayer(thing.marker);
			if(!$scope.map.options.__markers.length) {
				$scope.map.panTo(new L.LatLng(lat, lng));
			}
			$scope.map.options.__markers.push(thing.marker);
		}
		thing.marker.setLatLng([lat, lng]);
		thing.marker.bindPopup(thing.name + " (" + lat + "," + lng + ")");
	}

	var subscribeProp = function(thing, propName) {
		riots.subscribe({
			thingId: thing.id,
			propertyName: propName
		}, function(data) {
			$scope.$apply(function() {
				console.log(propName, data);
				if(propName == GEO_FENCE) {
					if(!thing.properties[propName]) {
						thing.properties[propName] = {}
					}
					var fences = thing.properties[propName]
					$.extend(fences, data.value);
					if($scope.geoFence && $scope.geoFence.id) {
						if(typeof fences[$scope.geoFence.id] != "undefined") {
							var isInFence = thing.properties.isInCurrentGeoFence = fences[$scope.geoFence.id];
							if(isInFence) {
								if(thing.marker) thing.marker.setIcon(getIcon("marker_green.png"));
							} else {
								if(thing.marker) thing.marker.setIcon(getIcon("marker_pink.png"));
							}
						}
					} else if(thing.marker) {
						thing.marker.setIcon(getIcon("marker_azure.png"));
					}
				} else {
					thing.properties[propName] = data.value;
					setMarker(thing);
				}
				if(propName == "location") {
					thing.properties["location.latitude"] = data.value.latitude;
					thing.properties["location.longitude"] = data.value.longitude;
					setMarker(thing);
				}
			});
		});
	}

	var getIcon = function(url) {
		var theURL = "/img/markers/" + url;
		var icon = L.icon({
		    iconUrl: theURL,
		    iconSize: [30, 30],
		    iconAnchor: [15, 15]
		});
		return icon;
	}

	var removeAllMarkers = function() {
		$.each($scope.things, function(idx,el) {
			if(el.marker) {
				$scope.map.removeLayer(el.marker);
			}
		});
	}

	var doLoadThings = function() {
		removeAllMarkers();
		riots.things({}, function(things) {
			$scope.$apply(function() {
				$scope.things = things;
			});
			var callback = function() {
				$.each(things, function(idx,thing) {
					thing.properties = {};
					subscribeProp(thing, "location");
					subscribeProp(thing, "location.latitude");
					subscribeProp(thing, "location.longitude");
					subscribeProp(thing, "pressure");
					subscribeProp(thing, "temperature");
					subscribeProp(thing, "batteryPercent");
					subscribeProp(thing, GEO_FENCE);
					riots.thingType(thing[THING_TYPE], function(thingType) {
						if(!thingType) return;
						$scope.$apply(function() {
							if(thingType[IMAGE_DATA] && thingType[IMAGE_DATA].length) {
								thing.img = thingType[IMAGE_DATA][0].href;
							}
						});
					});
				});
			}
			riots.unsubscribeAll(callback);
		});
	}

	$scope.loadThings = function() {
		if(!window.RIOTS_USER_ID || !window.RIOTS_APP_KEY) {
			alert("Please provide RIOTS_APP_KEY and RIOTS_USER_ID for authentication.");
			return;
		}
		riots.auth(null, function() {
			doLoadThings();
		}, function() {
			alert("Invalid authentication provided. Please check RIOTS_USER_ID and RIOTS_APP_KEY.");
		});
	};

	$scope.setupGeoFence = function() {
		if($scope.geoFence && $scope.geoFence.id) {
			riots.delete.trigger($scope.geoFence.id);
		}
		$.each($scope.things, function(idx,el) {
			delete el.properties.isInCurrentGeoFence;
			if(el.marker) {
				el.marker.setIcon(getIcon("marker_azure.png"));
			}
		});
		var center = $scope.map.getCenter();
		$scope.geoFence = {
			type: "GEO_FENCE",
			center: {
				latitude: center.lat,
				longitude: center.lng
			},
			diameter: $scope.diameter
		};
		riots.add.trigger($scope.geoFence, function(fence) {
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

	/* register event listeners */
	$scope.$watch("RIOTS_APP_KEY", function() {
		window.RIOTS_APP_KEY = $scope.RIOTS_APP_KEY;
	});
	$scope.$watch("RIOTS_USER_ID", function() {
		window.RIOTS_USER_ID = $scope.RIOTS_USER_ID;
	});

	/* load main elements */
	//$scope.loadThings();
	setupMap();
});
