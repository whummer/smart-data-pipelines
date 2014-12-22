
define(['app'], function(app) {
	app.controller('WorldViewController', [
		'$scope', '$http', '$compile',
		function($scope, $http, $compile) {

			AppController($scope, $http, $compile);
			//World3DController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemScenario");

			rootScope.worldViewEditMode = true;

			$scope.devicesAPI = appConfig.services.things.url;
			$scope.deviceTypesAPI = appConfig.services.thingTypes.url;
			$scope.deviceTypePropsAPI = appConfig.services.thingTypeProps.url;
			$scope.propValuesAPI = appConfig.services.things.url;

			$scope.listOfAssets = null;
			$scope.defaultLocation = {lat: 48.19742, lng: 16.37127};

			$scope.addAssetInDB = function(asset, callback){
				if(!asset)
					return false;
				invokePOSTandGET($scope.http, $scope.devicesAPI + "/",
					JSON.stringify(asset),
					function(data, status, headers, config) {
						if(callback) {
							callback(data.result);
						}
					}
				);
			}

			$scope.deleteAssetInDB = function(asset, callback){
				if(!asset || !asset.id) return;
				invokeDELETE($scope.http, 
					$scope.devicesAPI + "/" + asset.id,
					function(data, status, headers, config) {
						if(callback) {
							callback(asset);
						}
					}
				);
			}

			$scope.updateAssetInDB = function(asset, callback) {
				assetCopy = JSON.parse(JSON.stringify(asset));
				delete assetCopy["$$hashKey"];
				invokePUT($http, $scope.devicesAPI + '/',
					JSON.stringify(assetCopy),
					function(data, status, headers, config) {
						if(callback) {
							callback(asset);
						}
					}
				);
			};

			$scope.loadAssetsFromDB = function(callback) {
				max = 1000; // TODO
				invokeGET($http, $scope.devicesAPI + '/?page=0&size=' + max,
					function(data, status, headers, config) {
						if(callback) {
							callback(data.result);
						}
						$scope.listOfAssets = data.result;
						eventBus.publish("loadAll.Asset", {assets: data.result});
					}
				);
			};
			
		}
	]);
});
