
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

	var subscribeProp = function(thing, propName) {
		riots.subscribe({
			thingId: thing.id,
			propertyName: propName
		}, function(data) {
			$scope.$apply(function() {
				thing.properties[propName] = data.value
			});
		});
	}

	$scope.loadThings = function() {
		riots.things(function(things) {
			riots.unsubscribeAll();
			//$scope.$apply(function() {
				$scope.things = things;
			//});
			$.each(things, function(idx,thing) {
				thing.properties = {};
				subscribeProp(thing, "location.latitude");
				subscribeProp(thing, "location.longitude");
			});
		});
	};
	$scope.loadThings();
});
