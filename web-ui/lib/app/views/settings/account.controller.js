'use strict';

angular.module('rioxApp')
.controller('SettingsAccountCtrl', function ($scope, $state, User, Auth, $window, growl) {

	$scope.errors = {};
	$scope.ISO_3166_COUNTRIES = ISO_3166_COUNTRIES;

	$scope.changePassword = function(form) {
		$scope.submittedPW = true;
		var valid = form.$valid && (form.password.$viewValue == form.passwordRepeat.$viewValue);
		if(valid) {
			Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
			.then(function(obj) {
				$scope.message = "Password successfully changed.";
				growl.info("Password successfully changed");
			})
			.catch( function(err) {
				if(err && err.status == 403) {
					form.password.$setValidity("mongoose", false);
					$scope.errors.other = "Incorrect password";
				} else {
					form.password.$setValidity("mongoose", false);
					$scope.errors.password = err.data.error.errors.password.message;
				}
				$scope.message = "";
			});
		}
	};

	$scope.saveDetails = function(form) {
		$scope.submitted = true;

		if(!$scope.user[NAME] || $scope.user[NAME].match(/^\s*$/)) {
			form.username.$setValidity('mongoose', false);
			$scope.errors.username = "Please specify";
			return;
		}
		riox.save.me($scope.user, function(result) {
			Auth.setCurrentUser(result);
			growl.info("Account details successfully saved.");
		});
	};

	var loadDetails = function() {
		riox.me(function(me) {
			$scope.$apply(function() {
				$scope.user = me;
			});
		});
	}

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings.account", name: "Account" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	loadDetails();

});
