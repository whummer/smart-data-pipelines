define(['app'], function(app) {
    app.controller('ConnectViewController', ['$scope', '$http', '$compile', 
	function($scope, $http, $compile) {
		AppController($scope, $http, $compile);

		require(["leaflet"],
		function (L) {

			$scope.udateIntervalMS = "1000";
			var state = {};

			function updateInfoPeriodically() {
				/* update UI */
				showPosition();
				if(state.accel) {
					document.getElementById("x").innerHTML = state.accel.x;
					document.getElementById("y").innerHTML = state.accel.y;
					document.getElementById("z").innerHTML = state.accel.z;
				}
				/* send data to riots platform... */
				if($scope.isTracking) {
					var props = [
						"propAccelX", "propAccelY", "propAccelZ",
						"propLat", "propLng"
					];
					$.each(props, function(idx,el) {
						invokePOST($http, );
					});
				}
				/* timeout next loop */
				setTimeout(updateInfoPeriodically, parseInt($scope.udateIntervalMS));
			}

			function getAndStorePositionPeriodically(position) {
				if(position) {
					state.loc = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
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
				if(!state.loc) return;
				var markerData = {
					loc: state.loc,
					name: "Current Location"
				}
				var locArray = [ markerData.loc.lat, markerData.loc.lng ];
				document.getElementById("lat").innerHTML = markerData.loc.lat;
				document.getElementById("lon").innerHTML = markerData.loc.lng;
		
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
					console.log("adding marker layer");
				}
				window.map.options.userdata = markerData;
				var newLatLng = new L.LatLng(markerData.loc.lat, markerData.loc.lng);
			    window.marker.setLatLng(newLatLng); 
				console.log(window.marker);
				window.map.setView(locArray, window.map.getZoom());
			}
			window.ondevicemotion = function(event) {
				state.accel = {
					x: event.accelerationIncludingGravity.x,
					y: event.accelerationIncludingGravity.y,
					z: event.accelerationIncludingGravity.z,
					event: event
				}
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
				console.log("loadPropsFor", thingType);
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
				console.log("loadProps", thing, thingType);
				if(!thingType) return;
				if(thingType.id) {
					loadPropsForThingType(thingType);
				} else {
					shared.thingType(thingType, function(thingType) {
						loadPropsForThingType(thingType);
					});
				}
			}

			$scope.toggleTracking = function() {
				if($scope.isTracking) {
					$("#btnToggleTracking").innerHTML = "Stop Tracking";
				} else {
					$("#btnToggleTracking").innerHTML = "Start Tracking";
				}
				$scope.isTracking = !$scope.isTracking;
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