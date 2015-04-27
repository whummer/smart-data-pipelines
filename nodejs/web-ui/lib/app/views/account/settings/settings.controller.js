'use strict';

angular.module('rioxApp')
.controller('SettingsCtrl', function ($scope, User, Auth) {
	$scope.errors = {};

	$scope.changePassword = function(form) {
		$scope.submitted = true;
		if(form.$valid) {
			Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
			.then( function() {
				$scope.message = 'Password successfully changed.';
			})
			.catch( function() {
				form.password.$setValidity('mongoose', false);
				$scope.errors.other = 'Incorrect password';
				$scope.message = '';
			});
		}
	};

	$scope.saveDetails = function(form) {
		riox.save.me($scope.user, function(result) {
			console.log("success", result);
		});
	};

	var loadDetails = function() {
		riox.me(function(me) {
			$scope.$apply(function() {
				$scope.user = me;
			});
		});
	}

	/* load main elements */
	loadDetails();

});
