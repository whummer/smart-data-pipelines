'use strict';

angular.module('rioxApp')
.controller('SettingsAccountCtrl', function ($scope, User, Auth, $window) {

	$scope.errors = {};
	$scope.ISO_3166_COUNTRIES = ISO_3166_COUNTRIES;

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
		      /* 
		       * important: make sure to reload the entire page, to
		       * reset all controllers, flush state information, etc.
		       */
		      setTimeout(function(){
		    	  console.log("Reloading the page...");
		          $window.location.reload(); 
		      }, 100);
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
	$scope.setNavPath($scope);

	/* load main elements */
	loadDetails();

});
