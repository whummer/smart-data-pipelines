define(['app', 'bootstrap-tagsinput'], function(app) {



    app.controller('CatalogViewController',
		function($scope, $http, $compile, $log) {

			$log.debug("Inside CatalogViewController");

			AppController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemCatalog");

			$scope.thingTypesAPI = appConfig.services.thingTypes.url;
			$scope.thingTypePropsAPI = appConfig.services.thingTypeProps.url;
			$scope.semanticsAPI = appConfig.services.semanticTypes.url;
			$scope.driversAPI = appConfig.services.drivers.url;

			$scope.shared.selectedThingType = null;
        }
    );

	app.controller('ThingTypesController',

		function ($scope, $log) {

			$log.debug("Inside ThingTypesController");

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

			$scope.loadAllThingTypes = function () {
				console.log("Loading all thing types")
				invokeGET($scope.http, $scope.thingTypesAPI,
					function (data, status, headers, config) {
						var nodes = [];
						for (var i = 0; i < data.result.length; i++) {
							var obj = data.result[i];
							nodes.push(obj);
						}

						$scope.things = nodes;
						setTimeout(function () {
							setupDragAndDrop();
						}, 100);

					}
				);
			};

			$scope.loadAllThingTypes();

			/*$scope.saveThingType = function (thingType) {
				thingType = JSON.parse(JSON.stringify(thingType));
				$scope.prepareModelValues(thingType);
				delete thingType.drivers;
				console.log("saving thingType", thingType);
				invokePUT($scope.http, $scope.thingTypesAPI,
					JSON.stringify(thingType),
					function (data, status, headers, config) {
						$scope.loadAllThingTypes();
					}
				);
			};*/

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

			$scope.searchThingType = function () {
				console.log("search: " + $("#inputDevTypeSearch").val());
			};

			/* register event handlers*/
			$scope.addClickHandler('btnAddThingType', $scope.addThingType);
			//$scope.addClickHandler('btnDelThingType', $scope.deleteThingType);
			$scope.addClickHandler('btnSearchThingType', $scope.searchThingType);

			$scope.subscribeOnce("change.ThingTypeProps", function (event) {
					console.log("change.ThingTypeProps", event.changedItem);
					$scope.saveThingType(event.changedItem);
				}, "thingTypePropsChangeListener"
			);

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
