
define(['app'], function(app)
{
	app.controller('WorldViewController',
	[
		'$scope', '$http', '$compile',
		function($scope, $http, $compile) {
		
			AppController($scope, $http, $compile);

			$scope.page = {
				heading: 'World View'
			};
			$scope.http = $http;
			$scope.compile = $compile;
			$scope.coreAPI = "http://localhost:8080/api/v1";
			$scope.devicesAPI = $scope.coreAPI + "/devices";
			$scope.deviceTypesAPI = $scope.coreAPI + "/device-types";
			$scope.categoriesAPI = $scope.coreAPI + "/categories";
			$scope.dojo = rootDojo;
			$scope.registry = rootDijitRegistry;

			$scope.createAsset = function(asset) {
				alert("adding asset " + JSON.stringify(asset));
				invokePOST($http, $scope.devicesAPI + "/",
					JSON.stringify(asset),
					function(data, status, headers, config) {
						//alert("Successfully added asset: " + data)
						$scope.loadMarkers();
					}
				);
			};

			$scope.updateAsset = function(asset) {
				invokePUT($http, $scope.devicesAPI + '/',
					JSON.stringify(asset),
					function(data, status, headers, config) {
						//alert("Successfully added asset: " + data)
						$scope.loadMarkers();
					}
				);
			};

			$scope.loadMarkers = function() {
				maxMarkers = 1000; // TODO
				invokeGET($http, $scope.devicesAPI + '/?page=0&size=' + maxMarkers,
					function(data, status, headers, config) {
						$scope.displayMarkers(data.result, true);
					}
				);
			};

			$scope.importOSM = function(tagFilter) {
				center = map.getCenter();
				zoom = map.getZoom();
				request = {
						"latitude": center.lat,
						"longitude": center.lng,
						"zoom": zoom,
						"tags": tagFilter
				};
				$scope.setLoadingStatus(true, "Loading OSM data...");
				invokePOST($http, $scope.extAPI + '/osm/nodes',
					JSON.stringify(request),
					function(data, status, headers, config) {
						alert("Load OSM data: " + JSON.stringify(data))
						//$scope.loadMarkers();
						$scope.setLoadingStatus(false);
						$.each(data["result"], function(index, obj) {
							obj["name"] = JSON.stringify(tagFilter);
							if(obj["tags"]["species"]) {
								obj["name"] += " - " + obj["tags"]["species"];
							}
							$scope.addMarker(obj);
						});
					}
				);
			};

			$scope.addAsset = function() {
				latlng = map.getCenter();
				//alert("adding thing at " + latlng);
				asset = {
					"name": "unnamed", 
					"location": {
						"latitude": latlng.lat,
						"longitude": latlng.lng
					}
				};
				$scope.createAsset(asset);
			};

			$scope.deleteMarker = function (marker) {
				map.removeLayer(marker);
			};

			$scope.displayMarkers = function (markers, deleteExisting) {
				if(typeof map == 'undefined')
					return;
				if(deleteExisting) {
					$.each(map.options.__markers, function(index, marker) {
						$scope.deleteMarker(marker);
					});
					map.options.__markers = [];
				}
				$.each(markers, function(index, marker) {
					if(marker.location && marker.location.latitude
							&& marker.location.longitude) {
						$scope.addMarker(marker);
					}
				});
			};

			$scope.addMarker = function(m) {
				var marker = L.marker(
					[ m.location ? m.location.latitude : m.lat, 
					  m.location ? m.location.longitude : m.lon], 
					{
						draggable : true,
						title: m.name,
						userdata: m
					}
				).animateDragging().
				bindPopup(m.name).
				on("click", function() {
					$scope.$apply(function(){
						$scope.curAsset = m;
					});
				}).
				on("dragend", function(e) {
					asset = e.target.options.userdata;
					assetNew = {
						"id": asset.id,
						"location": {
							"latitude": e.target.getLatLng().lat,
							"longitude": e.target.getLatLng().lng
						}
					};
					$scope.updateAsset(assetNew);
				});
				map.addLayer(marker);
				map.options.__markers.push(marker);
				//marker.addTo(map);
				return marker;
			};

			$scope.loadMarkers();
		}
	]);
});