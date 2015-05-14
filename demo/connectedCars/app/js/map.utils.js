(function() {

	var x = window;

	x.setMarker = function (vehicle) {
		var lat = vehicle.properties["location.latitude"];
		var lng = vehicle.properties["location.longitude"];
		if (!lat || !lng) return;
		$log.debug("Settings lat/lng: ", lat, lng);
		//$log.debug("Other properties: ", vehicle);

		var vehicleMap = $scope.vehicleMap;
		if (!vehicle.vehicleMapMarker) {
			vehicle.vehicleMapMarker = L.marker([lat, lng]);
			vehicleMap.addLayer(vehicle.vehicleMapMarker);
			if (!vehicleMap.options.__markers.length) {
				vehicleMap.panTo( new L.LatLng(lat, lng));
			}

			vehicleMap.options.__markers.push(vehicle.vehicleMapMarker);
		}

		vehicle.vehicleMapMarker.setLatLng([lat, lng]);
		vehicleMap.panTo({lat: lat, lng: lng});
		vehicle.vehicleMapMarker.bindPopup(vehicle.name + " (" + lat + "," + lng + ")");

	};

})();