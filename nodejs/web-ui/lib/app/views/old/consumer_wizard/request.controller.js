'use strict';

angular.module('rioxApp').controller(
'ConsumerRequestCtrl', function ($scope, Auth, $stateParams, $state) {

	$scope.riox = riox;

	/* load source details */
	var loadSource = function() {
		var id = $stateParams.sourceId;
		if(!id) return;
		riox.streams.source(id, function(source) {
			$scope.$apply(function() {
				$scope.formData.selectedSource = source;
				$scope.prepareStreamSource(source);
				$scope.loadAccessStatus();
			});
		});
	};

	$scope.revokeRequest = function () {
		showConfirmDialog("Are you sure that you want to revoke the access request?", function () {
			riox.delete.access($scope.formData.sourceAccess, function(result) {
				$scope.loadAccessStatus();
			});
        });
	};

	$scope.requestAccess = function () {
		if (!$scope.formData.sourceAccess || !$scope.formData.sourceAccess.status) {
			var sourceAccess = {}
			sourceAccess[STATUS] = STATUS_REQUESTED;
			sourceAccess[SOURCE_ID] = $scope.formData.selectedSource.id;
			sourceAccess[REQUESTOR_ID] = $scope.getCurrentOrganization().id;
			riox.save.access(sourceAccess, function(sourceAccess) {
				$scope.formData.sourceAccess = sourceAccess;
				$scope.formData.sourceAccess.status = STATUS_REQUESTED;
				$scope.$apply(function() {
					$scope.loadAccessStatus();
				});
			});
		} else {
			$scope.formData.sourceAccess.status = STATUS_REQUESTED;
		}
	};

	$scope.loadAccessStatus = function (callback) {
		var query = {};
		query[SOURCE_ID] = $scope.formData.selectedSource.id;
		query[REQUESTOR_ID] = $scope.getCurrentOrganization().id;
		riox.access(query, function (access) {
			if(access[0]) {
				$scope.formData.sourceAccess = access[0];
			} else {
				$scope.formData.sourceAccess = {};
			}
			if (callback) {
				callback(access);
			}
		});
	};

	$scope.checkIfSourceSelected($stateParams); // call to parent controller

	/* load main elements */
	loadSource();

});
