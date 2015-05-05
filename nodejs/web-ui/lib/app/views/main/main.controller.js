'use strict';

angular.module('rioxApp')
  .controller('MainCtrl', function ($scope, $http, $location, $window, $state, Auth, $q) {

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.getCurrentOrganization = Auth.getCurrentOrganization;

    $scope.logout = function () {
      Auth.logout();
      $state.go('index.login');
      /* 
       * important: make sure to reload the entire page, to
       * reset all controllers, flush state information, etc.
       */
      $window.location.reload();
    };

    $scope.isActive = function (route) {
      return route === $location.path();
    };

    riox.defaultErrorCallback = function (p1, p2, p3, p4) {
      if (p1 == 401 || p1.status == 401) {
        //console.log("inv error", p1, p2, p3, p4);
        showConfirmDialog("Access denied. Please log in.", function () {
          $scope.logout();
        });
      }
    };

    $scope.loadDefaultOrganization = function () {
      var deferred = $q.defer();
      riots.organizations(function (orgs) {
        angular.forEach(orgs, function (org) {
          var userInfo = $scope.getCurrentUser();
          if (userInfo) {
            if (org[CREATOR_ID] == userInfo.id) {
              deferred.resolve(org);
            }
          } else {
            $log("Cannot determine user info from scope");
            deferred.reject("Unable to determine userInfo from scope.")
          }
        });

        deferred.reject("No default organization found");
      });

      return deferred.promise;
    }

    /* common util methods */
    $scope.range = function (from, to, step) {
      if (!step) step = 1;
      var result = [];
      for (var i = from; i <= to; i += step) {
        result.push(i);
      }
      return result;
    };
    $scope.dateFormat = "yyyy-MM-dd hh:mm:ss";
    $scope.formatTime = $scope.formatTime = function (timestamp) {
      if (!timestamp) {
        return null;
      }
      return formatDate(timestamp);
    };
    $scope.formatCoords = function (loc) {
      if (!loc)
        return "";
      var result = loc.latitude.toFixed(4) +
        "," + loc.longitude.toFixed(4);
      return result;
    };
    $scope.formatNumber = function (number, numDecimals) {
      if (typeof numDecimals == "undefined") {
        numDecimals = 2;
      }
      return number.toFixed(numDecimals);
    };


  });
