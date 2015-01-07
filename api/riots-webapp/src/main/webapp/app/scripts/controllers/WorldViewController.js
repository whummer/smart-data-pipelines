
define(['app'], function(app) {
	app.controller('WorldViewController', [
		'$scope', '$http', '$compile', '$routeParams',
		function($scope, $http, $compile, $routeParams) {

			AppController($scope, $http, $compile);
			//World3DController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemScenario");

			rootScope.worldViewEditMode = true;

			$scope.thingsAPI = appConfig.services.things.url;
			$scope.thingTypesAPI = appConfig.services.thingTypes.url;
			$scope.propValuesAPI = appConfig.services.things.url;
			$scope.driversAPI = appConfig.services.drivers.url;
			$scope.usersAPI = appConfig.services.users.url;
			$scope.utilsAPI = appConfig.services.utils.url;

			$scope.listOfThings = null;
			$scope.defaultLocation = {lat: 48.19742, lng: 16.37127};

			$scope.addThingInDB = function(thing, callback){
				if(!thing)
					return false;
				invokePOSTandGET($scope.http, $scope.thingsAPI + "/",
					JSON.stringify(thing),
					function(data, status, headers, config) {
						if(callback) {
							callback(data.result);
						}
					}
				);
			}

			$scope.deleteThingInDB = function(thing, callback){
				if(!thing || !thing.id) return;
				invokeDELETE($scope.http, 
					$scope.thingsAPI + "/" + thing.id,
					function(data, status, headers, config) {
						if(callback) {
							callback(thing);
						}
					}
				);
			}

			$scope.updateThingInDB = function(thing, callback) {
				thingCopy = JSON.parse(JSON.stringify(thing));
				delete thingCopy["$$hashKey"];
				if(thingCopy[THING_TYPE] && thingCopy[THING_TYPE].id) {
					thingCopy[THING_TYPE] = thingCopy[THING_TYPE].id;
				}
				invokePUT($http, $scope.thingsAPI + '/',
					JSON.stringify(thingCopy),
					function(data, status, headers, config) {
						if(callback) {
							callback(thing);
						}
					}
				);
			};

			$scope.loadThingsFromDB = function(callback) {
				max = 1000; // TODO
				invokeGET($http, $scope.thingsAPI + '/?page=0&size=' + max,
					function(data, status, headers, config) {
						if(callback) {
							callback(data.result);
						}
						$scope.listOfThings = data.result;
						eventBus.publish("loadAll.Thing", {things: data.result});
					}
				);
			};

			if($routeParams.appId) {
				$scope.shared.selectedApplication = riots.app($routeParams.appId);
			}
			
		}
	]);
});
