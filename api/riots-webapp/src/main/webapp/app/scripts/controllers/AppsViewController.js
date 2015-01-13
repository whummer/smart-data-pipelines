
define(['app'], function(app) {
	app.controller('AppsViewController', [
		'$scope', '$http', '$compile', '$routeParams', '$log', '$location',
		function($scope, $http, $compile, $routeParams, $log, $location) {

			AppController($scope, $http, $compile);
			//World3DController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemScenario");

			/* define model constants in angular scope */
			$scope.CREATION_DATE = CREATION_DATE;

			/* whether we can edit stuff on the "world" map view */
			rootScope.worldViewEditMode = true;

			$scope.thingsAPI = appConfig.services.things.url;
			$scope.thingTypesAPI = appConfig.services.thingTypes.url;
			$scope.propValuesAPI = appConfig.services.things.url;
			$scope.driversAPI = appConfig.services.drivers.url;
			$scope.usersAPI = appConfig.services.users.url;
			$scope.triggersAPI = appConfig.services.triggers.url;

			$scope.listOfThings = null;
			$scope.defaultLocation = {lat: 48.19742, lng: 16.37127};
			$scope.tabs = {active: 'things'};

			$scope.addThingInDB = function(thing, callback){
				if(!thing)
					return false;
				riots.add.thing(thing, function(newThing) {
					if(callback) {
						callback(newThing);
					}
				});
			}

			$scope.deleteThingInDB = function(thing, callback){
				if(!thing || !thing.id) return;
				riots.delete.thing(thing, function() {
					if(callback) {
						callback(thing);
					}
				});
			}

			$scope.updateThingInDB = function(thing, callback) {
				thingCopy = JSON.parse(JSON.stringify(thing));
				delete thingCopy["$$hashKey"];
				if(thingCopy[THING_TYPE] && thingCopy[THING_TYPE].id) {
					thingCopy[THING_TYPE] = thingCopy[THING_TYPE].id;
				}
				riots.save.thing(thingCopy, function(savedThing) {
					if(callback) {
						callback(savedThing);
					}
				});
			};

			$scope.loadThingsFromDB = function(callback) {
				riots.things(function(things) {
					if(callback) {
						callback(things);
					}
					$scope.listOfThings = things;
					eventBus.publish("loadAll.Thing", {things: things});
				});
			};

			if($routeParams.appId) {
				riots.app($routeParams.appId, function(app) {
					$scope.shared.selectedApplication = app;
				});
			}

			var loadUserInfo = function() {
				riots.me(function(me) {
					$scope.userInfo = me;
				});
			};

            var deleteApp = function () {
                var app = clone($scope.shared.selectedApplication);

                var location = "home";

                showConfirmDialog("Do you really want to delete this application?", function () {
                    riots.delete.app(app.id, function(newApp) {
                        $log.debug("Successfully delete app ", app.name);
                        $location.path(location);
                    });
                });
            };

            $scope.addClickHandler("btnDeleteApp", deleteApp);


			loadUserInfo();

		}
	]);
});
