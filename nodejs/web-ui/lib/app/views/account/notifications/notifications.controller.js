'use strict';

angular.module('rioxApp').controller('NotificationsCtrl',
function($scope, User, Auth) {

	$scope.load = function() {
		riox.access(function(accesses) {
			
		});
	};

	$scope.load();

});
