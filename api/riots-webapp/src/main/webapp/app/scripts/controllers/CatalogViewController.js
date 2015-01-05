define(['app', 'bootstrap-tagsinput'], function(app) {

	angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 250)

    app.controller('CatalogViewController',
		function($scope, $http, $compile, $log) {

			AppController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemCatalog");

			$scope.thingTypesAPI = appConfig.services.thingTypes.url;
			$scope.thingTypePropsAPI = appConfig.services.thingTypeProps.url;
			$scope.semanticsAPI = appConfig.services.semanticTypes.url;
			$scope.driversAPI = appConfig.services.drivers.url;
			$scope.searchText = '';
			$scope.shared.selectedThingType = null;
        }
    );

    
	// factory for infinite scrolling
    app.factory('ThingTypes', function($http) {
      var ThingTypes = function(thingTypesAPI, searchText) {
        this.api = thingTypesAPI;
        console.log("api: " + this.api)
        this.searchText = searchText;
        this.items = [];
        this.busy = false;
        this.page = 0;
        this.size = 50;
        this.fullyLoaded = false;
      };

      ThingTypes.prototype.nextPage = function() {
    	console.log("nextPage() called")
        if (this.busy || this.fullyLoaded) return;
        this.busy = true;

        invokeGET($http, this.api+"?q="+this.searchText+"&page=" + this.page + "&size=" + this.size,						
			function (data, status, headers, config) {
				var obj = data.result;
				//console.log(obj.size);
					
				var items = data.result;
				if (items.length == 0) {
					this.fullyLoaded = true;
				}
				for (var i = 0; i < items.length; i++) {
					this.items.push(items[i]);
				}
				this.page = this.page + 1;
				console.log("page: " + this.page)
				this.busy = false;
			}.bind(this));        
      };
      return ThingTypes;
    });
    
	app.controller('ThingTypesController',

		function ($scope, $log, ThingTypes) {			
		
			$log.debug("Inside ThingTypesController");
			
			// for infinite scrolling
			$scope.thingTypes = new ThingTypes($scope.thingTypesAPI, $scope.searchText);			

			$scope.showMore = function(thingId) {
				$("#" + thingId + "_description").removeClass("thing-type-box");
				$("#" + thingId + "_expand").addClass("hidden");
				$("#" + thingId + "_collapse").removeClass("hidden");
			};

			$scope.showLess = function(thingId) {
				$("#" + thingId + "_description").addClass("thing-type-box");
				$("#" + thingId + "_expand").removeClass("hidden");
				$("#" + thingId + "_collapse").addClass("hidden");
			};

			var setupDragAndDrop = function () {
				// set up drag/drop
				var selector = "#thingTypesTable .ui-grid-row";
				$(selector).draggable({
					helper: function () {
						return $("<div style='z-index: 100000'>" +
						"<img src='img/icon_map_add.png'/></div>");
					},
					start: function (event, ui) {
						$(this).css("z-index", 100000);
					},
					cursorAt: {top: 24, left: 25},
					appendTo: "body",
					zIndex: 100000
				});
			};
									
//			$scope.loadAllThingTypes = function () {
//				console.log("Loading all thing types")
//				invokeGET($scope.http, $scope.thingTypesAPI,
//					function (data, status, headers, config) {
//						var nodes = [];
//						for (var i = 0; i < data.result.length; i++) {
//							var obj = data.result[i];
//							nodes.push(obj);
//						}
//
//						$scope.things = nodes;
//						setTimeout(function () {
//							setupDragAndDrop();
//						}, 100);
//
//					}
//				);
//			};

			//$scope.loadAllThingTypes();
			
			// Entry point for key press during thing type search
			$scope.searchKeyPress = function ()  {
				console.log($scope.searchText);				
				invokeGET($scope.http, $scope.thingTypesAPI+"?q="+$scope.searchText,						
					function (data, status, headers, config) {
						var obj = data.result;
						console.log(obj.size)						
						$scope.things = data.result
					}									
				);
			}

			$scope.addThingType = function () {
				var items = [
					{id: "manual", name: "Add item manually"},
					{id: "wolfram", name: "Import from Wolfram Things"},
					{id: "iotdb", name: "Import from IoTDB"}
				];
				showSelectDialog("Select source:", items, function (el) {
					if (el.id == "manual") {
						$scope.addThingTypeManual();
					} else if (el.id == "wolfram") {
						importFromWolfram();
					} else if (el.id == "iotdb") {
						importFromIotdb();
					}
				});
			};

			$scope.addThingTypeManual = function (thingType) {
				if (!thingType) {
					thingType = {
						name: "unnamed"
					}
				}
				invokePOST($scope.http, $scope.thingTypesAPI + "/",
					JSON.stringify(thingType),
					function (data, status, headers, config) {
						$scope.loadAllThingTypes();
					}
				);
			};

			$scope.deleteThingType = function (thingType) {
				//var selection = $scope.selectedThingType;
				//if (!selection || !selection.id) return;
				$log.warn("About to delete ThingType: ", thingType);

				showConfirmDialog("Do you really want to delete this thing type?", function () {
					invokeDELETE($scope.http,
						$scope.thingTypesAPI + "/" + thingType.id,
						function (data, status, headers, config) {
							$scope.selectedThingType = $scope.shared.selectedThingType = null;
							$scope.loadAllThingTypes();
						}
					);
				});
			};

			/* register event handlers*/
			$scope.subscribeOnce("reload.ThingTypeProps", function (event) {
					$scope.loadAllThingTypes();
				}, "thingTypePropsReloadListener"
			);

			$scope.$watch("selectedThingType", function () {
				$("#btnDelThingType").prop("disabled", $scope.selectedThingType == null);
			});

			/* render main container */
		}
	);
});
