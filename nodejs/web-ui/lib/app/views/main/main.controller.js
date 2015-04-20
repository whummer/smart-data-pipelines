'use strict';

angular.module('rioxApp')
  .controller('MainCtrl', function ($scope, $http, $location, $window, Auth) {

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
      /* important: make sure to reload the entire page, to 
       * reset all controllers, state information, etc.
       */
      $window.location.reload();
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

  });
