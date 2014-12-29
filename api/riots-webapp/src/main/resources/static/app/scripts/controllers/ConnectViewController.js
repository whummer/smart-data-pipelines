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
					console.log(state.accel.event);
				}
		
				/* send data to riots platform... */
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
						//animateDragging().
						bindPopup(markerData.name)
						//on("click", function() {
						//}).
						//on("dragend", function(e) {
						//	var userData = e.target.options.userdata;
						//});
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
		
			setupMap();
			getAndStorePositionPeriodically();
			updateInfoPeriodically();

		});
    }
    ]);
});