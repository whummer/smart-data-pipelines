'use strict';

angular.module('rioxApp').controller('NotificationsCtrl',
function($scope, $state, Notifications) {

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
	$scope.getNavPart = function() {
		return { sref: "index.notifications ", name: "Notifications" };
	};
	$scope.setNavPath($scope, $state);

	/* load main elements */
	Notifications.loadNotifications();
});
