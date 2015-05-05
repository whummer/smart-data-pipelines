/**
 * Created by omoser on 05/05/15.
 */



function analyticsCtrl($scope, $log, $http) {

  $scope.loadAnalyticsModules = function() {
    riox.analytics(function(analytics) {
      $log.debug("Loaded analytics functions: ", analytics);
      $scope.analyticsModules = analytics;
    });
  };

  $scope.loadAnalyticsModules();
}

angular.module('rioxApp').controller("analyticsCtrl", analyticsCtrl);
