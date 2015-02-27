var GEO_FENCE = "riots.geoFence";

/** Extend Number object with method to convert numeric degrees to radians */
if (typeof Number.prototype.toRadians == 'undefined') {
	Number.prototype.toRadians = function () {
		return this * Math.PI / 180;
	};
}


/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (typeof Number.prototype.toDegrees == 'undefined') {
	Number.prototype.toDegrees = function () {
		return this * 180 / Math.PI;
	};
}

// hardcoded for testing
window.RIOTS_USER_ID = "54cfa5b0bee88c0d9b4d157a";
window.RIOTS_APP_KEY = "da022e9f-4a5b-4a6b-b2d6-9d1e199447c4";

var app = angular.module('demo', ['ui.knob', 'colorpicker.module']);
app.controller('MainCtrl', function ($scope, $log) {

	// controller configuration
	//$scope.diameter = 100;
	$scope.RIOTS_USER_ID = window.RIOTS_USER_ID;
	$scope.RIOTS_APP_KEY = window.RIOTS_APP_KEY;
	$scope.things = [];
	$scope.vehicleMaps = [];
	$scope.geoFences = [];
	$scope.showLoyalty = true;
	$scope.showInactive = false;

	function setupMap(mapName) {
		var defaultLocation = [48.19742, 16.37127];
		var map = L.map(mapName, {
			"maxZoom": 23,
			"__markers": []
		}).setView(defaultLocation, 18).on("mouseup", function (e) {
			//var newLoc = $scope.overviewMap.getCenter();
		});
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxZoom: 23,
			maxNativeZoom: 19
		}).addTo(map);

		$log.debug("Added new map with name '" + mapName + "': ", map);
		return map;
	}

	var addVehicleMaps = function () {
		angular.forEach($scope.things, function (thing) {
			var mapId = thing.id + "_map";
			$scope.vehicleMaps[mapId] = setupMap(mapId);
		});
	};

	var setMarker = function (thing) {
		var lat = thing.properties["location.latitude"];
		var lng = thing.properties["location.longitude"];
		if (!lat || !lng) return;
		if (!thing.overviewMapMarker) {
			var options = {};
			thing.overviewMapMarker = L.marker([lat, lng], options);
			$scope.overviewMap.addLayer(thing.overviewMapMarker);
			if (!$scope.overviewMap.options.__markers.length) {
				$scope.overviewMap.panTo(new L.LatLng(lat, lng));
			}
			$scope.overviewMap.options.__markers.push(thing.overviewMapMarker);
		}

		thing.overviewMapMarker.setLatLng([lat, lng]);
		thing.overviewMapMarker.bindPopup(thing.name + " (" + lat + "," + lng + ")");

		var vehicleMap = $scope.vehicleMaps[thing.id + "_map"];
		if (!thing.vehicleMapMarker) {
			var options = {};
			thing.vehicleMapMarker = L.marker([lat, lng], options);
			vehicleMap.addLayer(thing.vehicleMapMarker);
			if (!vehicleMap.options.__markers.length) {
				vehicleMap.panTo(new L.LatLng(lat, lng));
			}

			vehicleMap.options.__markers.push(thing.vehicleMapMarker);
		}

		thing.vehicleMapMarker.setLatLng([lat, lng]);
		vehicleMap.panTo(new L.LatLng(lat, lng));
		thing.vehicleMapMarker.bindPopup(thing.name + " (" + lat + "," + lng + ")");

	};

	var subscribeProp = function (thing, propName) {
		riots.subscribe({
			thingId: thing.id,
			propertyName: propName
		}, function (data) {
			$scope.$apply(function () {
				//		console.log(propName, data);
				if (propName == GEO_FENCE) {
					if (!thing.properties[propName]) {
						thing.properties[propName] = {}
					}
					var fences = thing.properties[propName]
					$.extend(fences, data.value);
					if ($scope.geoFence && $scope.geoFence.id) {
						if (typeof fences[$scope.geoFence.id] != "undefined") {
							var isInFence = thing.properties.isInCurrentGeoFence = fences[$scope.geoFence.id];
							if (isInFence) {
								if (thing.marker) thing.marker.setIcon(getIcon("marker_green.png"));
							} else {
								if (thing.marker) thing.marker.setIcon(getIcon("marker_pink.png"));
							}
						}
					} else if (thing.marker) {
						thing.marker.setIcon(getIcon("marker_azure.png"));
					}
				} else {
					thing.properties[propName] = data.value;
					setMarker(thing);
				}

				if (propName == "location") {
					thing.properties["location.latitude"] = data.value.latitude;
					thing.properties["location.longitude"] = data.value.longitude;
					setMarker(thing);
				}

				if (propName == "speed") {
					$log.debug("Triggering speed update for thing ", thing)
					angular.element('#' + thing.id + "_speed")
							.val(thing.properties.speed)
							.trigger('change')
				}
			});
		});
	};

	var processGeoFenceUpdate = function () {

	}

	var getIcon = function (url) {
		var theURL = "/img/markers/" + url;
		var icon = L.icon({
			iconUrl: theURL,
			iconSize: [30, 30],
			iconAnchor: [15, 15]
		});
		return icon;
	};

	var removeAllMarkers = function () {
		if (!$scope.things)
			return;

		angular.forEach($scope.things, function (thing) {
			if (thing.overviewMapMarker) {
				$scope.overviewMap.removeLayer(thing.overviewMapMarker);
			}

			if (thing.vehicleMapMarker) {
				$scope.overviewMap.removeLayer(thing.vehicleMapMarker);
			}
		});
	};

	var doLoadThings = function () {
		removeAllMarkers();
		riots.things({}, function (things) {
			$scope.$apply(function () {
				$scope.things = things;
			});
			var callback = function () {
				addVehicleMaps();

				$.each(things, function (idx, thing) {
					thing.properties = {};
					subscribeProp(thing, "location");
					subscribeProp(thing, "location.latitude");
					subscribeProp(thing, "location.longitude");
					subscribeProp(thing, "pressure");
					subscribeProp(thing, "temperature");
					subscribeProp(thing, "batteryPercent");
					subscribeProp(thing, "speed");
					subscribeProp(thing, "mileageRemaining");
					subscribeProp(thing, GEO_FENCE);
					riots.thingType(thing[THING_TYPE], function (thingType) {
						if (!thingType) return;
						$scope.$apply(function () {
							if (thingType[IMAGE_DATA] && thingType[IMAGE_DATA].length) {
								thing.img = thingType[IMAGE_DATA][0].href;
							}
						});
					});
				});
			};

			riots.unsubscribeAll(callback);
			setupSpeedCalc();
			setupRemainingMileage();
		});
	};

	$scope.loadThings = function () {
		if (!window.RIOTS_USER_ID || !window.RIOTS_APP_KEY) {
			alert("Please provide RIOTS_APP_KEY and RIOTS_USER_ID for authentication.");
			return;
		}
		riots.auth(null, function () {
			doLoadThings();
		}, function () {
			alert("Invalid authentication provided. Please check RIOTS_USER_ID and RIOTS_APP_KEY.");
		});
	};

	var setupSpeedCalc = function () {
		if (!$scope.things)
			return;
		var speedCalc = {
			name: "speedCalculator",
			property: "location.*",
			resultProperty: "speed",
			triggerFunction: "speed"
		};
		$.each($scope.things, function (idx, el) {
			speedCalc[THING_ID] = el.id;
			riots.add.trigger(speedCalc, function (speedCalc) {
				console.log("added speedCalc", speedCalc);
			});
		});
	};

	var setupRemainingMileage = function () {
		if (!$scope.things)
			return;
		var mileage = {
			name: "remainingMilageCalculator",
			property: "(location.*)|(fuelLevel)",
			resultProperty: "mileageRemaining",
			triggerFunction: "mileageRemaining",
			config: {
				percentagePropName: "fuelLevel"
			}
		};
		$.each($scope.things, function (idx, el) {
			mileage[THING_ID] = el.id;
			riots.add.trigger(mileage, function (mileage) {
				console.log("added mileage", mileage);
			});
		});
	};

	$scope.setupGeoFence = function () {

		$.each($scope.things, function (idx, el) {
			//delete el.properties.isInCurrentGeoFence;
			if (el.marker) {
				el.marker.setIcon(getIcon("marker_azure.png"));
			}
		});
		var center = $scope.overviewMap.getCenter();
		$scope.geoFence = {
			name: $scope.geoFenceName,
			property: "location.*",
			resultProperty: GEO_FENCE,
			triggerFunction: "geoFence",
			config: {
				center: {
					latitude: center.lat,
					longitude: center.lng
				},
				diameter: $scope.diameter,
				color: $scope.geoFenceColor
			}
		};

		riots.add.trigger($scope.geoFence, function (fence) {
			var loc = [fence.config.center.latitude, fence.config.center.longitude];
			var geoFenceOverlayOptions = {};
			if ($scope.geoFenceColor) {
				geoFenceOverlayOptions.color = $scope.geoFenceColor;
			}

			var geoFenceOverlay = L.circle(loc, fence.config.diameter, geoFenceOverlayOptions);
			geoFenceOverlay.addTo($scope.overviewMap);
			fence.overlay = geoFenceOverlay;
			$scope.$apply(function () {
				$scope.geoFences.push(fence);
			});
		});
	};

	/* register event listeners */
	$scope.$watch("RIOTS_APP_KEY", function () {
		window.RIOTS_APP_KEY = $scope.RIOTS_APP_KEY;
	});
	$scope.$watch("RIOTS_USER_ID", function () {
		window.RIOTS_USER_ID = $scope.RIOTS_USER_ID;
	});

	/* load main elements */
	$scope.overviewMap = setupMap("worldMap");

	$scope.carsInFence = function (fence) {
		return "";
	};

	$scope.removeGeoFence = function (fence) {
		riots.delete.trigger(fence.id);
		angular.forEach($scope.geoFences, function (geoFence, idx) {
			if (fence.id == geoFence.id) {
				$scope.geoFences.splice(idx, 1);
			}
		});

		$scope.overviewMap.removeLayer(fence.overlay)

	};

	console.log("Initialized sucessfully")


});
