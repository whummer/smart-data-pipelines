(function() {
	var module = angular.module("riox-map-leaflet", ["leaflet-directive"], function($compileProvider) {

		$compileProvider.directive('compile', function($compile) {
			return function(scope, element, attrs) {
				scope.$watch(
					function(scope) {
						return scope.$eval(attrs.compile);
					},
					function(value) {
						element.html(value);
						$compile(element.contents())(scope);
					}
				);
			};
		});

	});

	module.directive('markerLabel', function ($compile) {
	    return {
	    	restrict: "E",
	    	replace: false,
	    	template: function(elem, attrs) {
	    		return '<div compile="template"></div>';
	    	},
	    	scope: {
				template: '=',
				object: '='
			},
		    controller: function($scope) {
		    	for(var key in $scope.object) {
		    		$scope[key] = $scope.object[key];
		    	}
		    }
	    }
	});

	var leafletMapController = function($scope, leafletData) {

		$scope.map = {
				markers: {},
				center: {},
				objects: {}
		};

		var getObjectIDs = function() {
			return elasticsearch.getObjectIDs($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.idField);
		};
		var getAllObjectDetails = function(ids) {
			return elasticsearch.getAllObjectDetails($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.idField, ids);
		};

		leafletData.getMap().then(function(map) {
			$scope.map.map = map;
	    });

		var displayObjects = function(objects) {
			objects.forEach(function(obj) {
				setMarker(obj);
			});
			fitMapZoomToMarkers();
		};

		var getLocation = function(obj) {
			if(obj.lon) obj.lng = obj.lon;
			if(obj.lat && obj.lng) return obj;
			var result = {};
			var idx = obj.indexOf(",");
			result.lat = obj.substring(0, idx);
			result.lng = obj.substring(idx + 1, obj.length);
			if(typeof result.lat == "string") result.lat = parseFloat(result.lat);
			if(typeof result.lng == "string") result.lng = parseFloat(result.lng);
			return result;
		}

		var fitMapZoomToMarkers = function() {
			var markerArray = [];
			for(var key in $scope.map.markers) {
				var marker = $scope.map.markers[key];
				markerArray.push(L.marker([marker.lat, marker.lng]));
			}
			var group = new L.featureGroup(markerArray);
			$scope.map.map.fitBounds(group.getBounds());
		};

		var setMarker = function (object) {
			var loc = getLocation(object[$scope.locField]);
			var lat = loc.lat;
			var lng = loc.lng;
			if (!lat || !lng) return;

			var id = object[$scope.idField];
			$scope.map.objects[id] = object;
			var marker = $scope.map.markers[id];
			if (!marker) {
				marker = {
	                lat: lat,
	                lng: lng,
	                focus: false,
	                compileMessage: true,
	                message: '<marker-label template="labelTemplate" object="map.objects[\'' + id + '\']"></marker-label>',
	                draggable: false,
	                getMessageScope: function() { return $scope; },
	                _object: object
	            }
				$scope.map.markers[id] = marker;
			}
			marker.lat = lat;
			marker.lng = lng;
			$scope.$apply();
		};

		$scope.displayMap = function() {
			getObjectIDs().
				then(getAllObjectDetails).
				then(displayObjects);
		};

		$scope.displayMap();
	}

	module.directive('rioxMapLeaflet', function ($compile) {

		return {
	    	restrict: "E",
	    	replace: false,
	    	template: function(elem, attrs) {
	    		return '<leaflet ' + 
	    				(!attrs.width ? "" : (' width="' + attrs.width + '"')) + 
	    				(!attrs.height ? "" : (' height="' + attrs.height + '"')) + 
	    				' markers="map.markers" center="map.center"></leaflet>';
	    	},
	    	scope: {
	    		mapMarkers: '=',
	    		mapCenter: '=',
	    		esUrl: '=',
	    		esIndexName: '=',
	    		esTypeName: '=',
	    		idField: '=',
	    		locField: '=',
	    		labelTemplate: '='
			},
			controller: leafletMapController
		};
	});	
})();
