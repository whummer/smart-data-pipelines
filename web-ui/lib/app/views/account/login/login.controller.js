'use strict';

angular.module('rioxApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window) {
	$scope.user = {};
	$scope.errors1 = {};
	$scope.errors2 = {};
	$scope.loginType = "userPass";

	$scope.login = function(form) {
		$scope.submitted = true;

		if(form.$valid) {

			var request = {};
			if($scope.loginType == "userPass") {
				request[EMAIL] = $scope.user.email;
				request[PASSWORD] = $scope.user.password;
			} else if($scope.loginType == "apiKey") {
				request[API_KEY] = $scope.user.apiKey;
			}

			Auth.
			login(request).
			then( function() {
				// Logged in, redirect to home
				$location.path('/');
			}).
			catch(function(err) {
				if($scope.loginType == "userPass") {
					$scope.errors1.other = err.message || err.error;
				} else if($scope.loginType == "apiKey") {
					$scope.errors2.other = err.message || err.error;
				}
			});
		}
	};

	$scope.loginOauth = function(provider) {
	  $window.location.href = '/auth/' + provider;
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.login", name: "Login" };
	};
	$scope.setNavPath($scope);
});
