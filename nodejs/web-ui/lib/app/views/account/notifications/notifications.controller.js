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

	Notifications.loadNotifications();

});
