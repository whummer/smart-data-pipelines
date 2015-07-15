define(['app'], function(app) {
    app.controller('ConnectViewController', ['$scope', '$http', '$compile', 
	function($scope, $http, $compile) {

		AppController($scope, $http, $compile);
		$scope.thingsAPI = appConfig.services.things.url;

		require(["leaflet"],
		function (L) {

			/* leaflet initialization */
			L.Icon.Default.imagePath = 'img/markers/';

			$scope.udateIntervalMS = "1000";
			var PROP_LAT = "propLat", PROP_LNG = "propLng";
			var PROP_ACCEL_X = "propAccelX", PROP_ACCEL_Y = "propAccelY", PROP_ACCEL_Z = "propAccelZ";

			var state = {};
			var trackedProps = [
				PROP_ACCEL_X, PROP_ACCEL_Y, PROP_ACCEL_Z,
				PROP_LAT, PROP_LNG
			];

			function updateInfoPeriodically() {
				/* update UI */
				showPosition();
				if(state[PROP_ACCEL_X]) {
					document.getElementById("x").innerHTML = state[PROP_ACCEL_X];
					document.getElementById("y").innerHTML = state[PROP_ACCEL_Y];
					document.getElementById("z").innerHTML = state[PROP_ACCEL_Z];
				}
				/* send data to riots platform... */
				if($scope.isTracking) {
					if($scope[PROP_LAT] && $scope[PROP_LNG]) {
						sendLocationData();
					}
					if($scope[PROP_ACCEL_X] && $scope[PROP_ACCEL_Y] && $scope[PROP_ACCEL_Z]) {
						sendAccelerationData();
					}
				}
				/* timeout next loop */
				setTimeout(updateInfoPeriodically, parseInt($scope.udateIntervalMS));
			}

			function sendLocationData() {
				var propNameLat = $scope[PROP_LAT].name;
				var propNameLng = $scope[PROP_LNG].name;
				
				if(propNameLat.indexOf(".") >= 0 && propNameLng.indexOf(".") >= 0) {
					var parentPropLat = propNameLat.substring(0, propNameLat.indexOf("."));
					var parentPropLng = propNameLng.substring(0, propNameLng.indexOf("."));
					if(parentPropLat == parentPropLng) {
						/* CASE 1: send lat/lon in a common location object! */
						var childPropLat = propNameLat.substring(propNameLat.indexOf(".") + 1);
						var childPropLng = propNameLng.substring(propNameLng.indexOf(".") + 1);
						var value = {};
						value[childPropLat] = state[PROP_LAT];
						value[childPropLng] = state[PROP_LNG];
						sendData(parentPropLat, value);
						return;
					}
				}
				/* CASE 2: send latitude and longitude separately! */
				sendData(propNameLat, state[PROP_LAT]);
				sendData(propNameLng, state[PROP_LNG]);
			}

			function sendAccelerationData() {
				// TODO send in a common parent prop (see location above)
				sendData($scope[PROP_ACCEL_X].name, state[PROP_ACCEL_X]);
				sendData($scope[PROP_ACCEL_Y].name, state[PROP_ACCEL_Y]);
				sendData($scope[PROP_ACCEL_Z].name, state[PROP_ACCEL_Z]);
			}

			function sendData(propName, propValue) {
				var url = $scope.thingsAPI + "/" +
					$scope.thingSelected.id + "/" + propName;
				data = {};
				data[THING_ID] = $scope.thingSelected.id;
				data[PROPERTY_NAME] = propName;
				data[PROPERTY_VALUE] = propValue;
				data[TIMESTAMP] = new Date().getTime();
				console.log("adding data", data);
				riots.add.data(data, data, null,
					function() {
						// error callback
						setTracking(false);
						showErrorDialog("Cannot send thing data.", 
						"There was an error sending your thing data (this may be a temporary problem). " +
						"The data transmission has been paused.");
					}
				);
			}

			function getAndStorePositionPeriodically(position) {
				if(position) {
					state.propLat = position.coords.latitude;
					state.propLng = position.coords.longitude;
				} else {
					if (navigator.geolocation) {
				        navigator.geolocation.getCurrentPosition(getAndStorePositionPeriodically);
						setTimeout(getAndStorePositionPeriodically, parseInt($scope.udateIntervalMS));
				    } else {
				        $("#info").html("Geolocation is not supported by this browser.");
				    }
				}
			}
			function showPosition() {
				if(!state.propLat) return;
				var markerData = {
					loc: {
						lat: state.propLat,
						lng: state.propLng
					},
					name: "Current Location"
				}
				var locArray = [ markerData.loc.lat, markerData.loc.lng ];
				$("#lat").html(markerData.loc.lat);
				$("#lon").html(markerData.loc.lng);

				if(!window.marker) {
					var options = {
						draggable: false,
						title: markerData.name,
						userdata: markerData
					};
					window.marker = L.marker(locArray,options).
						bindPopup(markerData.name)
					window.map.options.__markers.push(window.marker);
					window.map.addLayer(window.marker);
				}
				window.map.options.userdata = markerData;
				var newLatLng = new L.LatLng(markerData.loc.lat, markerData.loc.lng);
			    window.marker.setLatLng(newLatLng); 
				window.map.setView(locArray, window.map.getZoom());
			}
			window.ondevicemotion = function(event) {
				state.propAccelX = event.accelerationIncludingGravity.x;
				state.propAccelY = event.accelerationIncludingGravity.y;
				state.propAccelZ = event.accelerationIncludingGravity.z;
			}
			function setupMap() {
				var defaultLocation = [ 48.19742, 16.37127 ];
				window.map = L.map("worldMap", {
					"maxZoom": 23,
					"__markers": []
				}).
				setView(defaultLocation, 18).
				on("mouseup", function(e) {
					var newLoc = map.getCenter();
				});
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					maxZoom: 23,
					maxNativeZoom: 19
				}).addTo(map);
			}

			function loadThings() {
				riots.things({}, function(things) {
					$scope.things = things;
				});
			}

			function loadPropsForThingType(thingType) {
				if(thingType) {
					$scope.properties = [];
					riots.properties(thingType, function(properties) {
						if(properties) {
							$.each(properties, function(idx,el) {
								$scope.properties.push(el);
							});
						}
					});
				}
			}

			function loadProps() {
				var thing = $scope.thingSelected;
				if(!thing) return;
				var thingType = thing[THING_TYPE];
				if(!thingType) return;
				if(thingType.id) {
					loadPropsForThingType(thingType);
				} else {
					riots.thingType(thingType, function(thingType) {
						loadPropsForThingType(thingType);
					});
				}
			}

			function setTracking(doTrack) {
				$scope.isTracking = doTrack;
				if($scope.isTracking) {
					$("#btnToggleTracking").html("Stop Tracking");
				} else {
					$("#btnToggleTracking").html("Start Tracking");
				}
			}
			$scope.toggleTracking = function() {
				setTracking(!$scope.isTracking);
			}

			/* initialize elements */
			loadThings();
			setupMap();
			getAndStorePositionPeriodically();
			updateInfoPeriodically();

			/* register event listeners */
			$scope.$watch("thingSelected", function() {
				loadProps();
			});

		});
    }
    ]);
});