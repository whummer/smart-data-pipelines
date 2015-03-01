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
			$scope.RIOTS_USER_ID = window.RIOTS_USER_ID;
			$scope.RIOTS_APP_KEY = window.RIOTS_APP_KEY;
			$scope.things = [];
			$scope.vehicleMaps = [];
			$scope.geoFences = [];
			$scope.showLoyalty = true;
			$scope.showInactive = false;
			$scope.showTooltips = false;
			$scope.triggers = {
				usageCalc: {},
				speedCalc : {},
				mileage : {}
			};

			$scope.vouchers = [
				{id: "mcdonalds", src: "mc-donalds.png"},
				{id: "omv", src: "omv.jpeg"}
			];



			//
			// functions for maps setup
			//
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

			//
			// functions for map markers
			//
			var setMarker = function (thing) {
				var lat = thing.properties["location.latitude"];
				var lng = thing.properties["location.longitude"];
				if (!lat || !lng) return;
				if (!thing.overviewMapMarker) {
					thing.overviewMapMarker = L.marker([lat, lng]);
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
					thing.vehicleMapMarker = L.marker([lat, lng]);
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


			//
			// functions for updates on vehicles
			//
			var subscribeProp = function (thing, propName) {
				riots.subscribe({
					thingId: thing.id,
					propertyName: propName
				}, function (data) {
					$scope.$apply(function () {

						//$log.debug("Got update for property: ", propName);

						if (propName == GEO_FENCE) {
							if (!thing.properties[propName]) {
								thing.properties[propName] = {}
							}

							thing.properties.withinGeoFences = [];

							var fences = thing.properties[propName];
							$.extend(fences, data.value);
							angular.forEach($scope.geoFences, function (geoFence) {
								if (geoFence && geoFence.id) {
									var isInFence = fences[geoFence.id];
									if (isInFence) {
										thing.properties.withinGeoFences.push(geoFence);
										if (thing.overviewMapMarker) {
											thing.overviewMapMarker.setIcon(getIcon("marker_green.png"));
										}
									} else {
										if (thing.overviewMapMarker) {
											thing.overviewMapMarker.setIcon(getIcon("marker_pink.png"));
										}
									}
								} else if (thing.marker) {
									thing.overviewMapMarker.setIcon(getIcon("marker_azure.png"));
								}
							});
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
							angular.element('#' + thing.id + "_speed")
									.val(thing.properties.speed * 3.6) // m/s -> km/h
									.trigger('change')
						}


						if (propName == "fuelLevel") {
							angular.element('#' + thing.id + "_fuel")
									.val(thing.properties.fuelLevel) // m/s -> km/h
									.trigger('change')
						}
					});
				});
			};

			var doLoadConfiguration = function () {
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
							subscribeProp(thing, "fuelLevel");
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
					setupUsageCalc();
					setupSpeedCalc();
					setupRemainingMileage();
					loadGeoFences();
				});
			};

			$scope.reloadConfiguration = function () {
				if (!window.RIOTS_USER_ID || !window.RIOTS_APP_KEY) {
					alert("Please provide RIOTS_APP_KEY and RIOTS_USER_ID for authentication.");
					return;
				}
				riots.auth(null, function () {
					doLoadConfiguration();
				}, function () {
					alert("Invalid authentication provided. Please check RIOTS_USER_ID and RIOTS_APP_KEY.");
				});
			};

			//
			// trigger functions
			//
			$scope.removeAllTriggers = function () {
				$log.warn("About to remove all triggers from application");
				riots.triggers(function (triggers) {
					angular.forEach(triggers, function (trigger) {
						riots.delete.trigger(trigger.id);
					});
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

				angular.forEach($scope.things, function (vehicle) {
					speedCalc[THING_ID] = vehicle.id;

					if ($scope.triggers.speedCalc[vehicle.id]) {
						riots.delete.trigger($scope.triggers.speedCalc[vehicle.id]);
					}

					riots.add.trigger(speedCalc, function (speedCalc) {
						$scope.triggers.speedCalc[vehicle.id] = speedCalc.id;
						$log.debug("added speedCalc", speedCalc);
					});
				});
			};

			var setupUsageCalc = function () {
				if (!$scope.things)
					return;

				var usageCalc = {
					name: "fuelConsumptionCalculator",
					property: "(location.*)|(fuelLevel)",
					triggerProperty: "location.*",
					resultProperty: "fuelLevel",
					triggerFunction: "gasUsage",
					config: {
						levelPropName: "fuelLevel",
						consumptionPercentPerKm: 1
					}
				};

				angular.forEach($scope.things, function (vehicle) {
					usageCalc[THING_ID] = vehicle.id;
					if ($scope.triggers.usageCalc[vehicle.id]) {
						riots.delete.trigger($scope.triggers.usageCalc[vehicle.id]);
					}

					riots.add.trigger(usageCalc, function (usageCalc) {
						$scope.triggers.usageCalc[vehicle.id] = usageCalc.id;
						$log.debug("added usageCalc", usageCalc);
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

				angular.forEach($scope.things, function (vehicle) {
					mileage[THING_ID] = vehicle.id;
					if ($scope.triggers.mileage[vehicle.id]) {
						riots.delete.trigger($scope.triggers.mileage[vehicle.id]);
					}

					riots.add.trigger(mileage, function (mileage) {
						$scope.triggers.mileage[vehicle.id] = mileage.id;
						$log.debug("added mileage", mileage);
					});
				});
			};

			$scope.setupGeoFence = function () {
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

				if ($scope.selectedVoucher) {
					$scope.geoFence.config.voucher =  {
						id: $scope.selectedVoucher.id,
						src: $scope.selectedVoucher.src
					}
				}

				riots.add.trigger($scope.geoFence, function (fence) {
					$log.debug("Created geofence: ", fence);
					addFenceToMap(fence);
				});
			};

			//
			// voucher stuff
			//
			$scope.selectVoucher = function(voucher) {
				$scope.selectedVoucher = voucher;
				$scope.voucherDescription = voucher.id;
			};

			//
			// geo fence functions
			//
			var addFenceToMap = function (fence) {
				var loc = [fence.config.center.latitude, fence.config.center.longitude];
				var geoFenceOverlayOptions = {};

				if (fence.config.color) {
					geoFenceOverlayOptions.color = fence.config.color;
				}

				var geoFenceOverlay = L.circle(loc, fence.config.diameter, geoFenceOverlayOptions);
				geoFenceOverlay.addTo($scope.overviewMap);
				fence.overlay = geoFenceOverlay;
				$scope.$apply(function () {
					$scope.geoFences.push(fence);
				});
			};


			$scope.carsInFence = function (fence) {
				return "";
			};

			var loadGeoFences = function () {
				$scope.geoFences = [];
				riots.triggers(function (triggers) {
					angular.forEach(triggers, function (trigger) {
						if (trigger.triggerFunction == "geoFence") {
							addFenceToMap(trigger);
						}
					});
				});
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

			//
			// register event listeners
			//
			$scope.$watch("RIOTS_APP_KEY", function () {
				window.RIOTS_APP_KEY = $scope.RIOTS_APP_KEY;
			});

			$scope.$watch("RIOTS_USER_ID", function () {
				window.RIOTS_USER_ID = $scope.RIOTS_USER_ID;
			});

			function toggleVehicleTooltips(showTooltips) {
				angular.forEach($scope.things, function (vehicle) {
					if (vehicle.overviewMapMarker) {
						if (showTooltips) {
							vehicle.overviewMapMarker.openPopup();
						} else {
							vehicle.overviewMapMarker.closePopup();
						}
					}
				});
			}

			$scope.$watch("showTooltips", function () {
				$log.debug("Toggling tooltips: ", $scope.showTooltips);
				toggleVehicleTooltips($scope.showTooltips);
			});


			//
			// load overview map
			//
			$scope.overviewMap = setupMap("worldMap");

			console.log("Initialized sucessfully")
		}
);

