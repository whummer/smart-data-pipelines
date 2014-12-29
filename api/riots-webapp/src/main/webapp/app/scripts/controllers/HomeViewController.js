define(['app'], function(app){
	app.controller('HomeViewController', function($scope, $http, $compile, $log) {
			AppController($scope, $http, $compile);

			$scope.statsAPI = appConfig.services.stats.url;
			$scope.usersAPI = appConfig.services.users.url;
			$scope.highlightMenuItem("#menuItemDashboard");

			$scope.selectedWidget = null;
			$scope.userConfig = null;

			$scope.addWidget = function() {
				var url = $scope.usersAPI + "/by/email/" + authInfo.email + "/config";
				$scope.userConfig.dashboardElements.push(
					{widgetType: $scope.selectedWidget}
				);
				invokePUT($http, url, 
					JSON.stringify($scope.userConfig),
					function(data, status, headers, config) {
						$scope.userConfig = data.result;
						console.log($scope.userConfig);
					}
				);
			};

			$scope.removeWidget = function(widgetType) {
				$log.debug("Removing widget " + widgetType + " from userconfig: ", $scope.userConfig);
				var url = $scope.usersAPI + "/by/email/" + authInfo.email + "/config";

				$.each($scope.userConfig.dashboardElements, function(idx, el) {
					if (el) {
						if (widgetType === el['widgetType']) {
							$scope.userConfig.dashboardElements.splice(idx, 1);
						}
					} else {
						$scope.userConfig.dashboardElements.splice(idx, 1);
					}
				});

				invokePUT($http, url, JSON.stringify($scope.userConfig), function(data, status, headers, config) {
						$scope.userConfig = data.result;
						$log.debug("Userconfig: ", $scope.userConfig);
					}
				);
			};

			$scope.removeAllWidgets = function() {
				$log.debug("Removing all widgets from userconfig: ", $scope.userConfig);
				var url = $scope.usersAPI + "/by/email/" + authInfo.email + "/config";
				$scope.userConfig.dashboardElements = [];
				invokePUT($http, url, JSON.stringify($scope.userConfig), function(data, status, headers, config) {
						$scope.userConfig = data.result;
						$log.debug("Userconfig: ", $scope.userConfig);
					}
				);
			};

			var loadWidgets = function() {
				var url = $scope.usersAPI + "/by/email/" + authInfo.email + "/config";
				invokeGET($http, url, 
					function(data, status, headers, config) {
						$scope.userConfig = data.result;
					}
				);
			};

			loadWidgets();

        }
	);
});