'use strict';

angular.module('rioxApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $window, $state, $stateParams) {
	$scope.user = {};
	$scope.errors = {};

	$scope.register = function(form) {
		$scope.submitted = true;
 
		if(form.$valid) {
			Auth.createUser({
				firstname: $scope.user.firstname,
				lastname: $scope.user.lastname,
				email: $scope.user.email,
				password: $scope.user.password,
				organization: $scope.user.organization
			})
			.then( function() {
				// Account created, redirect to login
				showSuccessDialog("Your new account has been created! We've sent you an email with instructions to activate the account.", function() {
					$state.go('index.login');
				});
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
		var url = window.appConfig.services.users.url + "/auth/" + provider;
		$window.location.href = url;
	};

	var activate = function() {
		var key = $stateParams.activationKey;
		riox.activate(key, function() {
			$scope.activationSuccess = true;
			$scope.$apply();
		}, function() {
			$scope.activationError = true;
			$scope.$apply();
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
