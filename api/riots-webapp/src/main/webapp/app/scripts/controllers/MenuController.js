/**
 * Created by omoser on 18/12/14.
 * @author omoser
 * @author whummer
 */

var app = angular.module('app');

app.controller('MenuController', function ($scope, $log, $http, $location, $compile) {

	$log.info("Inside MenuController");
	AppController($scope, $http, $compile);

	var loadApps = function () {
		$scope.shared.applications = [];
		if (!$scope.authInfo) {
			return;
		}
		riots.apps(function (apps) {
			$scope.shared.applications = apps;
		});
	};

	$scope.appNumber = 1;
	//$scope.CREATION_DATE = CREATION_DATE

	$scope.addApplication = function () {
		var newApp = {name: "New Application"};
		riots.add.app(newApp, function (newApp) {
			if (!$scope.shared.applications) {
				$scope.shared.applications = [];
			}
			$scope.shared.applications.push(newApp);
			console.log("newApp", newApp);
			$log.debug("Redirecting to new app with ID: ", newApp.id);
			$location.path("apps/" + newApp.id);
		});

	};

	$scope.$watch("authInfo", function () {
		loadApps();
	});

	var pollingInterval = 1000 * 5;
	var loadUsagePeriodically = function () {
		riots.usage(function (usage) {
			$scope.authInfo.usage = usage;
			/* repeat after timeout */
			setTimeout(function () {
				loadUsagePeriodically();
			}, pollingInterval);
		}, function () {
			/* error, stop polling */
		});
	};

	loadApps();
	loadUsagePeriodically();

});

app.controller('ModalAddDeviceTypeController', function ($scope, $modal, $log, $http, $compile, hotkeys) {

	$log.debug("Hotkeys: ", hotkeys);

	$scope.openAddThingTypeModal = function (size) {

		var modalInstance = $modal.open({
			templateUrl: appConfig['appRootPath'] + '/views/modal_add_device.html',
			controller: 'ModalAddDeviceTypeInstanceCtrl',
			size: size
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
		}, function () {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

});


app.controller('ModalAddDeviceTypeInstanceCtrl', function ($scope, $modalInstance, $log, $http, $location, $compile) {

	AppController($scope, $http, $compile);

	//$scope.items = items;
	$scope.selected = {
		item: 'riots'
	};

	$scope.http = $http;

	$scope.getImgSrcForSelectedItem = function (selectedItem) {
		$log.info("Selected item in render(): " + selectedItem);

		if (selectedItem == 'wolfram') {
			return "/app/img/wolfram_devices.jpeg";
		} else if (selectedItem == 'sparkfun') {
			return "/app/img/sparkfun.jpg";
		} else if (selectedItem == 'riots') {
			return "/app/img/riots.png";
		} else if (selectedItem == 'iotdb') {
			return "/app/img/iotdb.png";
		} else {
			return "/app/img/riots.png";
		}
	};


	var addNewDeviceTypeManual = function ($scope, $location, $log) {
		var deviceType = {
			name: "unnamed"
		};
		invokePOST($scope.http, appConfig.services.thingTypes.url + "/",
				JSON.stringify(deviceType),
				function (data, status, headers, config) {
					$log.info("Location: " + headers("Location"));
					var location = headers("Location");
					// Location: /catalog/things/1969990191366059219
					var thingId = location.split('/')[3];
					$log.info("ThingId: " + thingId);
					$location.path("catalog/" + thingId);
				}
		);
	}

	$scope.ok = function () {
		$log.info("Selected item: " + $scope.selected.item);
		if ($scope.selected.item == 'riots') {
			addNewDeviceTypeManual($scope, $location, $log);
		} else {
			$log.warn("Selected thing type not yet implemented");
		}

		$modalInstance.close($scope.selected.item);

	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
