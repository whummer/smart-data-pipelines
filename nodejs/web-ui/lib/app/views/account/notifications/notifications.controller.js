'use strict';

angular.module('rioxApp').controller('NotificationsCtrl',
function($scope, Notifications) {

	$scope.resolve = function(notif) {
		notif[STATUS] = STATUS_READ;
		riox.save.notification(notif, function() {
			Notifications.loadNotifications();
		});
	};

	$scope.delete = function(notif) {
		riox.delete.notification(notif, function() {
			Notifications.loadNotifications();
		});
	};

	/* get nav. bar stack */
	$scope.getNavPath = function() {
		var path = [
			{ sref: "index.notifications ", name: "Notifications" }
		];
		$scope.shared.navigationPath = path;
		return path;
	};

	/* load main elements */
	Notifications.loadNotifications();
	$scope.getNavPath();
});
