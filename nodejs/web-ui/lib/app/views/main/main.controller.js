'use strict';

angular.module('rioxApp')
  .controller('MainCtrl', function ($scope, $http, $location, $window, $state, Auth) {

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

    riox.defaultErrorCallback = function(p1, p2, p3, p4) {
    	console.log("inv error", p1, p2, p3, p4);
    	if(p1.status == 401) {
    		//$state.go('index.login');
    		showConfirmDialog("Access denied. Please log in.");
    	}
    };

	$scope.checkAuthTimeout = function() {
		
	};
    
  });
