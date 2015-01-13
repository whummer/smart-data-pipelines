define(['app'], function(app){
	app.controller('HomeViewController', function($scope, $http, $compile, $log) {
			AppController($scope, $http, $compile);

			$scope.highlightMenuItem("#menuItemDashboard");

			$scope.selectedWidget = null;
			$scope.userConfig = null;

			var saveConfig = function() {
				riots.save.config($scope.userConfig, function(cfg) {
					$scope.userConfig = cfg;
				});
			}

			$scope.addWidget = function() {
				$scope.userConfig.dashboardElements.push(
					{widgetType: $scope.selectedWidget}
				);
				saveConfig();
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
				saveConfig();
			};

			$scope.removeAllWidgets = function() {
				$log.debug("Removing all widgets from userconfig: ", $scope.userConfig);
				$scope.userConfig.dashboardElements = [];
				saveConfig();
			};

			var loadWidgets = function() {
				riots.config(function(cfg) {
					$scope.userConfig = cfg;
				});
			};

			loadWidgets();

        }
	);
});