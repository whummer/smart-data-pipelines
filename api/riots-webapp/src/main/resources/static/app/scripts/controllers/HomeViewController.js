define(['app'], function(app){
	app.controller('HomeViewController', [
		'$scope', '$http', '$compile',
		function($scope, $http, $compile) {
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
			}
			var loadWidgets = function() {
				var url = $scope.usersAPI + "/by/email/" + authInfo.email + "/config";
				invokeGET($http, url, 
					function(data, status, headers, config) {
						$scope.userConfig = data.result;
					}
				);
			}
			loadWidgets();

        }
	]);
});