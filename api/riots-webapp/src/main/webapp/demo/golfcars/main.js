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

var app = angular.module('demo', ['ui.knob', 'colorpicker.module', 'angular-peity']);
app.controller('MainCtrl', function ($scope, $log, $interval) {

			// controller configuration
			$scope.RIOTS_USER_ID = window.RIOTS_USER_ID;
			$scope.RIOTS_APP_KEY = window.RIOTS_APP_KEY;
			$scope.things = [];
			$scope.vehicleMaps = [];
			$scope.geoFences = [];
			$scope.showLoyalty = true;
			$scope.showInactive = false;
			$scope.showTooltips = false;
			$scope.geoFenceLayerGroup = L.layerGroup();
			$scope.removeExistingTriggers = true;

			$scope.updatesReceived = 0;

			$scope.LineChart = {
				data: [],
				options: {
					fill: '#1ab394',
					stroke: '#169c81',
					width: 64
				}
			};

			$scope.triggers = {
				usageCalc: {},
				speedCalc: {},
				mileage: {}
			};

			$scope.vouchers = [
				{id: "mcdonalds", src: "mc-donalds.png"},
				{id: "omv", src: "omv.jpeg"}
			];

			//
			// functions for maps setup
			//
			function setupMap(mapName, zoomLevel) {
				var defaultLocation = [48.19742, 16.37127];
				var map = L.map(mapName, {
					"maxZoom": 23,
					"__markers": []
				}).setView(defaultLocation, zoomLevel).on("mouseup", function (e) {
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
					$scope.vehicleMaps[mapId] = setupMap(mapId, 16);
				});
			};

			//
			// functions for map markers
			//
			var getGeofenceListForPopup = function (vehicle) {
				var geoFenceList = "";
				angular.forEach(vehicle.properties.withinGeoFences, function (geoFence) {
					geoFenceList += "<span class='label' style='color: white; background-color: " + geoFence.config.color + "'>";
					geoFenceList += geoFence.name + "</span>";
					geoFenceList += '<span ng-show="!$last">&nbsp;&nbsp;</span>';
					geoFenceList += '</span>';
				});

				return geoFenceList;
			};

			var setMarker = function (vehicle) {
				var lat = vehicle.properties["location.latitude"];
				var lng = vehicle.properties["location.longitude"];
				if (!lat || !lng) return;
				if (!vehicle.overviewMapMarker) {
					vehicle.overviewMapMarker = L.marker([lat, lng]);
					$scope.overviewMap.addLayer(vehicle.overviewMapMarker);
					if (!$scope.overviewMap.options.__markers.length) {
						$scope.overviewMap.panTo(new L.LatLng(lat, lng));
					}
					$scope.overviewMap.options.__markers.push(vehicle.overviewMapMarker);
				}

				vehicle.overviewMapMarker.setLatLng([lat, lng]);

				var popupContent = "<h5>" + vehicle.name + "</h5>" +
						"Position: " + lat.toFixed(5) + "," + lng.toFixed(5) + "<br/>" +
						"In Geofence: " + getGeofenceListForPopup(vehicle);
				if (!vehicle.overviewMapPopup) {
					vehicle.overviewMapPopup = L.popup({offset: L.point(0, -25)});
				}

				vehicle.overviewMapPopup.setLatLng([lat, lng]).setContent(popupContent);
				vehicle.overviewMapMarker.bindPopup(vehicle.overviewMapPopup);

				var vehicleMap = $scope.vehicleMaps[vehicle.id + "_map"];
				if (!vehicle.vehicleMapMarker) {
					vehicle.vehicleMapMarker = L.marker([lat, lng]);
					vehicleMap.addLayer(vehicle.vehicleMapMarker);
					if (!vehicleMap.options.__markers.length) {
						vehicleMap.panTo(new L.LatLng(lat, lng));
					}

					vehicleMap.options.__markers.push(vehicle.vehicleMapMarker);
				}

				vehicle.vehicleMapMarker.setLatLng([lat, lng]);
				vehicleMap.panTo(new L.LatLng(lat, lng));
				vehicle.vehicleMapMarker.bindPopup(vehicle.name + " (" + lat + "," + lng + ")");

			};

			var getIcon = function (url) {
				var theURL = "/img/markers/" + url;
				return L.icon({
					iconUrl: theURL,
					iconSize: [30, 30],
					iconAnchor: [15, 15]
				});
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
			function updateReceiveRate(vehicle) {
				if (!vehicle.startTime) {
					vehicle.startTime = new Date().getTime();
				}

				vehicle.properties.updatesReceived++;
				var now = new Date().getTime();
				var elapsed = now - vehicle.startTime;
				vehicle.properties.updateRate = vehicle.properties.updatesReceived / (elapsed / 1000);
			}

			function updateAverageSpeed(vehicle) {
				if (vehicle.properties.speedHistory.length > 3) {
					var sum = 0;
					angular.forEach(vehicle.properties.speedHistory, function (speed) {
						sum += speed;
					});

					vehicle.properties.averageSpeed = sum / vehicle.properties.speedHistory.length;
				}
			}


			var subscribeProp = function (vehicle, propName) {
				riots.subscribe({
					thingId: vehicle.id,
					propertyName: propName
				}, function (data) {
					$scope.$apply(function () {

						// set vehicle state

						vehicle.active = true;
						vehicle.lastUpdate = new Date();

						if (!vehicle.timer) {
							vehicle.timer = $interval(function() {
								var noUpdateFor = new Date().getTime() - vehicle.lastUpdate;
								vehicle.active = noUpdateFor <= 5000;
							}, 2500, 0, true);
						}
						if (!vehicle.locationTimer) {
							vehicle.locationTimer = $interval(function() {
								var noUpdateFor = new Date().getTime() - vehicle.lastLocationUpdate;
								vehicle.locationActive = noUpdateFor <= 5000;
							}, 2500, 0, true);
						}

						updateReceiveRate(vehicle);
						updateHistoryChart(vehicle.properties.updateRateHistory,
								vehicle.properties.updateRate, '#' + vehicle.id + "_updatechart");

						//$log.debug("Got update for property: ", propName);

						if (propName == GEO_FENCE) {
							if (!vehicle.properties[GEO_FENCE]) {
								vehicle.properties[GEO_FENCE] = {}
							}

							vehicle.properties.withinGeoFences = [];

							var fences = vehicle.properties[GEO_FENCE];
							$.extend(fences, data.value);
							angular.forEach($scope.geoFences, function (geoFence) {
								if (geoFence && geoFence.id) {
									var isInFence = fences[geoFence.id];
									if (isInFence) {
										vehicle.properties.withinGeoFences.push(geoFence);
										if (vehicle.properties.receivedVouchers.indexOf(geoFence.config.voucher.src) == -1) {
											vehicle.properties.receivedVouchers.push(geoFence.config.voucher.src);
										}

										if (vehicle.overviewMapMarker) {
											vehicle.overviewMapMarker.setIcon(getIcon("marker_green.png"));
										}
									} else {
										if (vehicle.overviewMapMarker) {
											vehicle.overviewMapMarker.setIcon(getIcon("marker_pink.png"));
										}
									}
								} else if (vehicle.overviewMapMarker) {
									vehicle.overviewMapMarker.setIcon(getIcon("marker_azure.png"));
								}
							});
						} else {
							vehicle.properties[propName] = data.value;
							setMarker(vehicle);
						}

						if (propName == "location") {
							vehicle.lastLocationUpdate = vehicle.lastUpdate;
							vehicle.properties["location.latitude"] = data.value.latitude;
							vehicle.properties["location.longitude"] = data.value.longitude;
							setMarker(vehicle);
						}

						if (propName == "speed") {

							var kmh = vehicle.properties.speed * 3.6;
							angular.element('#' + vehicle.id + "_speed")
									.val(kmh)
									.trigger('change');

							updateHistoryChart(vehicle.properties.speedHistory, kmh, '#' + vehicle.id + "_speedchart");
							updateAverageSpeed(vehicle);
						}


						if (propName == "fuelLevel") {
							angular.element('#' + vehicle.id + "_fuel")
									.val(vehicle.properties.fuelLevel)
									.trigger('change')
						}

						if (propName == "milage") {
							angular.element('#' + vehicle.id + "_milage")
									.val(vehicle.properties.mileageRemaining)
									.trigger('change')

						}
					});
				});
			};

			var updateHistoryChart = function (history, value, chartElementName) {
				if (!isNaN(parseFloat(value)) && isFinite(value)) {
					history.push(value);
				}

				if (history.length > 50) {
					history.shift();
				}

				var chart = angular.element(chartElementName);
				chart.text(history.join(","));
				chart.change();
			};

			var doLoadConfiguration = function () {
				removeAllMarkers();
				riots.things({}, function (vehicles) {
					$scope.$apply(function () {
						$scope.things = vehicles;
					});
					var callback = function () {
						addVehicleMaps();

						angular.forEach(vehicles, function (vehicle) {
							vehicle.properties = {};
							vehicle.properties.receivedVouchers = [];
							vehicle.properties.speedHistory = [];
							vehicle.properties.updateRateHistory = [];
							vehicle.properties.updatesReceived = 0;
							angular.element('#' + vehicle.id + "_speedchart").peity("line", {
								width: "100%",
								height: 30,
								min: 5,
								max: 50
							});

							angular.element('#' + vehicle.id + "_updatechart").peity("line", {
								width: "100%",
								height: 30,
								min: 5,
								max: 50
							});
							subscribeProp(vehicle, "location");
							subscribeProp(vehicle, "location.latitude");
							subscribeProp(vehicle, "location.longitude");
							subscribeProp(vehicle, "pressure");
							subscribeProp(vehicle, "temperature");
							subscribeProp(vehicle, "fuelLevel");
							subscribeProp(vehicle, "speed");
							subscribeProp(vehicle, "mileageRemaining");
							subscribeProp(vehicle, GEO_FENCE);
							riots.thingType(vehicle[THING_TYPE], function (thingType) {
								if (!thingType) return;
								$scope.$apply(function () {
									if (thingType[IMAGE_DATA] && thingType[IMAGE_DATA].length) {
										vehicle.img = thingType[IMAGE_DATA][0].href;
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

			$scope.reloadConfiguration = function (removeTriggers) {
				if (!window.RIOTS_USER_ID || !window.RIOTS_APP_KEY) {
					alert("Please provide RIOTS_APP_KEY and RIOTS_USER_ID for authentication.");
					return;
				}
				riots.auth(null, function () {
					if (removeTriggers) {
						$scope.removeAllTriggers(true);
					} else {
						doLoadConfiguration();
					}
				}, function () {
					alert("Invalid authentication provided. Please check RIOTS_USER_ID and RIOTS_APP_KEY.");
				});
			};

			//
			// trigger functions
			//
			$scope.removeAllTriggers = function (reloadConfiguration) {
				$log.warn("About to remove all triggers from application");
				riots.delete.triggersForCreator($scope.RIOTS_USER_ID, function () {
					if (reloadConfiguration) {
						$scope.reloadConfiguration(false);
					}
				})
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
					triggerProperty: "location.*",
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
					$scope.geoFence.config.voucher = {
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
			$scope.selectVoucher = function (voucher) {
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
				//geoFenceOverlay.addTo($scope.overviewMap);
				$scope.geoFenceLayerGroup.addLayer(geoFenceOverlay);
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

				$scope.geoFenceLayerGroup.removeLayer(fence.overlay);
				//$scope.overviewMap.removeLayer(fence.overlay)
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
							vehicle.overviewMapPopup.addTo($scope.overviewMap);
						} else {
							$scope.overviewMap.removeLayer(vehicle.overviewMapPopup);
						}
					}
				});
			}

			$scope.$watch("showTooltips", function () {
				$log.debug("Toggling tooltips: ", $scope.showTooltips);
				toggleVehicleTooltips($scope.showTooltips);
			});

			function toggleLoyaltyFences(showLoyalty) {
				if (showLoyalty) {
					if ($scope.overviewMap.hasLayer($scope.geoFenceLayerGroup)) {
						$log.debug("Loyalty layer already exists on overview map, not adding");
					} else {
						$log.debug("Adding loyalty fence layer group to overview map");
						$scope.overviewMap.addLayer($scope.geoFenceLayerGroup);
					}
				} else {
					if ($scope.overviewMap.hasLayer($scope.geoFenceLayerGroup)) {
						$log.debug("Removing loyalty fence layer group from overview map");
						$scope.overviewMap.removeLayer($scope.geoFenceLayerGroup);
					} else {
						$log.debug("No loyalty layer on overview map, not removing");
					}
				}
			}

			$scope.$watch("showLoyalty", function () {
				$log.debug("Toggling loyalty fences: ", $scope.showLoyalty);
				toggleLoyaltyFences($scope.showLoyalty);
			});

			//
			// load overview map
			//
			$scope.overviewMap = setupMap("worldMap", 13);
			$scope.geoFenceLayerGroup.addTo($scope.overviewMap);

			console.log("Initialized sucessfully")
		}
);

