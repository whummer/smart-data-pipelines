'use strict';

angular.module('rioxApp')
.controller('RecoverCtrl', function ($scope, Auth, growl) {

	$scope.formData = {};

	$scope.recover = function(form) {
		$scope.submitted = true;
		var req = {};
		req[EMAIL] = $scope.formData.userEmail;
		$scope.messages = "";
		riox.recover(req, function(result) {
			form.email.$setValidity('email', true);
			$scope.messages = "Your password has been successfully reset. Please check your email for instructions.";
			growl.info("Password reset. Please check your email for instructions. ");
		}, function(err) {
			$scope.$apply(function() {
				form.email.$setValidity('email', false);
				//$scope.messages = "Something went wrong. Please check your email address or try again later.";
			});
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.recover", name: "Recover Password" };
	};
	$scope.setNavPath($scope);
});
