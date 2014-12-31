
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

$(document).ready(function() {
	setupMap();
});

var app = angular.module('demo', []);
app.controller('MainCtrl', function ($scope) {

	var loadThings = function() {
		riots.things(function(things) {
			console.log("things", things);
			$scope.$apply(function() {
				$scope.things = things;
				$.each(things, function(idx,thing) {
					riots.subscribe({
						thingId: thing.id
					}, function(data) {
						console.log("property changed:", data);
					});
				});
			});
			$.each(things, function(idx,el) {
				
			});
		});
	}
	loadThings();
});
