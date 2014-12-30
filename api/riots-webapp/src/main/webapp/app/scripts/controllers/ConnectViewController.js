define(['app'], function(app) {
    app.controller('ConnectViewController', ['$scope', '$http', '$compile', 
	function($scope, $http, $compile) {

		AppController($scope, $http, $compile);
		$scope.thingsAPI = appConfig.services.things.url;

		require(["leaflet"],
		function (L) {

			$scope.udateIntervalMS = "1000";
			var state = {};
			var trackedProps = [
				"propAccelX", "propAccelY", "propAccelZ",
				"propLat", "propLng"
			];

			function updateInfoPeriodically() {
				/* update UI */
				showPosition();
				if(state.propAccelX) {
					document.getElementById("x").innerHTML = state.propAccelX;
					document.getElementById("y").innerHTML = state.propAccelY;
					document.getElementById("z").innerHTML = state.propAccelZ;
				}
				/* send data to riots platform... */
				if($scope.isTracking) {
					$.each(trackedProps, function(idx,el) {
						if($scope[el]) {
							var url = $scope.thingsAPI + "/" +
								$scope.thingSelected.id + "/" + $scope[el].name;
							console.log("sending", el, url);
							data = {};
							data[THING_ID] = $scope.thingSelected.id;
							data[PROPERTY_NAME] = $scope[el].name;
							data[PROPERTY_VALUE] = state[el];
							data[TIMESTAMP] = state[el];
							invokePOST($http, url, JSON.stringify(data), 
								function() {
									// success
								}, function() {
									// error
									setTracking(false);
									showErrorDialog("Cannot send thing data.", 
									"There was an error sending your thing data (this may be a temporary problem). The data transmission has been paused.");
								}
							);
						}
					});
				}
				/* timeout next loop */
				setTimeout(updateInfoPeriodically, parseInt($scope.udateIntervalMS));
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
				document.getElementById("lat").html(markerData.loc.lat);
				document.getElementById("lon").html(markerData.loc.lng);

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
				shared.things(function(things) {
					$scope.things = things;
				});
			}

			function loadPropsForThingType(thingType) {
				if(thingType) {
					$scope.properties = [];
					model.properties(thingType, function(properties) {
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
					shared.thingType(thingType, function(thingType) {
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