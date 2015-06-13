'use strict';

angular.module('rioxApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window, $stateParams) {
	$scope.user = {};
	$scope.errors = {};

	$scope.register = function(form) {
		$scope.submitted = true;
 
		if(form.$valid) {
			Auth.createUser({
				firstname: $scope.user.firstname,
				lastname: $scope.user.lastname,
				email: $scope.user.email,
				password: $scope.user.password
			})
			.then( function() {
			  // Account created, redirect to home
			  $location.path('/');
			})
			.catch( function(err) {
			  err = err.data.error;
			  $scope.errors = {};
	
			  // Update validity of form fields that match the mongoose errors
			  angular.forEach(err.errors, function(error, field) {
				form[field].$setValidity('mongoose', false);
				$scope.errors[field] = error.message;
			  });
			});
		}
	};

	$scope.loginOauth = function(provider) {
		var url = appConfig.services.users.url + "/auth/" + provider;
		console.log(url);
		$window.location.href = url;
	};

	var activate = function() {
		var key = $stateParams.activationKey;
		riox.activate(key, function() {
			$scope.activationSuccess = true;
		}, function() {
			$scope.activationError = true;
		});
	};

	if($stateParams.activationKey) {
		activate();
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.signup", name: "Signup" };
	}
	$scope.setNavPath($scope);

});
