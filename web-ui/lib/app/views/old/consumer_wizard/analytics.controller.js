/**
 * Created by omoser on 05/05/15.
 */

function analyticsCtrl($scope, $log, $http, $stateParams) {

	$scope.loadAnalyticsModules = function() {
		riox.analytics(function(analytics) {
			$log.debug("Loaded analytics functions: ", analytics);
			analytics.unshift($scope.DFLT_ANALYTICS_FUNCTION);
			$scope.analyticsModules = analytics;
		});
	};

	$scope.checkIfSourceSelected($stateParams); // call to parent controller
	$scope.loadAnalyticsModules();
}

angular.module('rioxApp').controller("analyticsCtrl", analyticsCtrl);
