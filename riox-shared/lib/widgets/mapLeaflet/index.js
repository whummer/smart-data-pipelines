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
				markers: [],
				center: {},
				objects: {}
		};
		$scope.timeField = $scope.timeField || "timestamp";
		$scope.esIndexName = $scope.esIndexName || 'ORG_ID'; // TODO don't hardcode here (?)
		$scope.esUrl = $scope.esUrl || '/api/v1/gateway/elasticsearch/'; // TODO don't hardcode here (?)

		var isArray = function(someVar) {
			return Object.prototype.toString.call( someVar ) === '[object Array]';
		};
		var clone = function(obj) {
			return JSON.parse(JSON.stringify(obj));
		};

		var getObjectIDs = function() {
			if(!isArray($scope.idField)) $scope.idField = [$scope.idField];
			return elasticsearch.getObjectIDs($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.idField);
		};
		var getAllObjectDetails = function(ids) {
			return elasticsearch.getAllObjectDetails($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.idField, ids, $scope.timeField);
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
			if(!obj) return {};
			if(obj.lon) obj.lng = obj.lon;
			if(obj.lat && obj.lng) return obj;
			var result = {};
			var parts = obj.split(/[\s,]+/);
			if(parts.length == 2) {
				result.lat = parts[0];
				result.lng = parts[1];
			}
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

		var findInList = function(list, obj, fields, idxField) {
			for(var i = 0; i < list.length; i ++) {
				var tmp = list[i];
				if(idxField) tmp = tmp[idxField];
				var equal = true;
				fields.forEach(function(field) {
					if(tmp[field] != obj[field]) {
						equal = false;
					}
				});
				if(equal) return tmp;
			}
		};

		var setMarker = function (object) {
			var loc = getLocation(object[$scope.locField]);
			var lat = loc.lat;
			var lng = loc.lng;
			if (!lat || !lng) return;

			var marker = findInList($scope.map.markers, object, $scope.idField, "_key");
			if (!marker) {
				var id = "" + new Date().getTime() + "-" + Math.random();
				$scope.map.objects[id] = object;
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
				marker["_key"] = clone(object);
				$scope.map.markers.push(marker);
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
