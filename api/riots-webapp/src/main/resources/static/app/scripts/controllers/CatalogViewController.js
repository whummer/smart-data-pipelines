define(['app'], function(app) {

	console.log("Entering CatalogViewController.js");

    app.controller('CatalogViewController', [
        '$scope', '$http', '$compile',
		function($scope, $http, $compile) {

			AppController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemCatalog");

			$scope.deviceTypesAPI = appConfig.services.thingTypes.url;
			$scope.deviceTypePropsAPI = appConfig.services.thingTypeProps.url;
			$scope.semanticsAPI = appConfig.services.semanticTypes.url;
			$scope.driversAPI = appConfig.services.deviceDrivers.url;

			$scope.shared.selectedDeviceType = null;
        }
    ]);

	app.controller('DeviceTypesController',

		function ($scope) {

			console.log("DeviceTypesController");

			$scope.showMore = function(deviceId) {
				$("#" + deviceId + "_description").removeClass("device-type-box");
				$("#" + deviceId + "_expand").addClass("hidden");
				$("#" + deviceId + "_collapse").removeClass("hidden");
			};

			$scope.showLess = function(deviceId) {
				$("#" + deviceId + "_description").addClass("device-type-box");
				$("#" + deviceId + "_expand").removeClass("hidden");
				$("#" + deviceId + "_collapse").addClass("hidden");
			};

			var setupDragAndDrop = function () {
				// set up drag/drop
				var selector = "#deviceTypesTable .ui-grid-row";
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

			$scope.loadAllDeviceTypes = function () {
				console.log("Loading all device types")
				invokeGET($scope.http, $scope.deviceTypesAPI,
					function (data, status, headers, config) {
						var nodes = [];
						for (var i = 0; i < data.result.length; i++) {
							var obj = data.result[i];
							nodes.push(obj);
						}

						$scope.devices = nodes;
						setTimeout(function () {
							setupDragAndDrop();
						}, 100);

					}
				);
			};

			$scope.loadAllDeviceTypes();

			$scope.deleteDeviceType = function (deviceId) {
				/*var selection = $scope.selectedDeviceType;
				if (!selection || !selection.id) return;*/
				showConfirmDialog("Do you really want to delete this device type?", function () {
					invokeDELETE($scope.http,
						$scope.deviceTypesAPI + "/" + deviceId,
						function (data, status, headers, config) {
							$scope.selectedDeviceType = $scope.shared.selectedDeviceType = null;
							$scope.loadAllDeviceTypes();
						}
					);
				});
			};

			$scope.searchDeviceType = function () {
				console.log("search: " + $("#inputDevTypeSearch").val());
			};

			/* register event handlers*/
			$scope.addClickHandler('btnSearchDeviceType', $scope.searchDeviceType);

			/*$scope.subscribeOnce("change.DeviceTypeProps", function (event) {
					console.log("change.DeviceTypeProps", event.changedItem);
					$scope.saveDeviceType(event.changedItem);
				}, "deviceTypePropsChangeListener"
			);

			$scope.subscribeOnce("reload.DeviceTypeProps", function (event) {
					$scope.loadAllDeviceTypes();
				}, "deviceTypePropsReloadListener"
			);

			$scope.$watch("selectedDeviceType", function () {
				$("#btnDelDeviceType").prop("disabled", $scope.selectedDeviceType == null);
			});*/

			/* render main container */
		}
	);
});