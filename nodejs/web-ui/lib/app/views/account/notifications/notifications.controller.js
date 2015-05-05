'use strict';

angular.module('rioxApp').controller('NotificationsCtrl',
function($scope, User, Auth) {

	$scope.notifications = [];

	$scope.load = function() {
		var query = {};
		$scope.notifications = [];
		riox.access(query, function(accesses) {
//			console.log(accesses);
			$.each(accesses, function(idx,el) {
				el.type = "Access Request";
				el.text = "User requested access to stream #1";
				el.time = formatDate(el.changed);
				el.unresolved = el.status == "requested";
				console.log(el);
				$scope.notifications.push(el);
			});
		});
	};

	$scope.load();

});
