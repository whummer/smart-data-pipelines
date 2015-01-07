define(['app'], function(app) {
    app.controller('ProfileViewController',
    	['$scope', '$http', '$compile', function($scope, $http, $compile) {
			AppController($scope, $http, $compile);

			$scope.usersAPI = appConfig.services.users.url;

			var loadUserInfo = function() {
				invokeGET($http, $scope.usersAPI + "/me", 
				function(data, status, headers, config) {
					$scope.userInfo = data.result;
				});
			}
			loadUserInfo();

        }
    ]);
});
