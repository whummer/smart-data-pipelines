'use strict';

angular.module('rioxApp')
.controller('InvitationCtrl', function ($scope, User, Auth, $window, $state, $stateParams) {

	$scope.state = $state.current;
	$scope.status = "Loading ...";

	var loadMembership = function() {
		var memId = $stateParams.membershipId;
		var user = Auth.getCurrentUser();
		if(!memId) return;
		/* load membership */
		riox.organization.membership(memId, function(mem) {
			$scope.membership = mem;

			/* load organization */
			riox.organization($scope.membership[ORGANIZATION_ID], function(org) {
				$scope.organization = org;
				
				$scope.$apply(function() {
					if(user[ID] != mem[MEMBER]) {
						$scope.status = "The current user does not match the invitation link. Please log in with the correct user account.";
					} else if($scope.state.name == 'index.reject') {
						reject();
					} else if($scope.state.name == 'index.accept') {
						accept();
					}
				});
			});
		});
	};

	var reject = function() {
		$scope.status = "Invitation has been rejected on your behalf.";
	};
	var accept = function() {
		$scope.status = "Successfully joined the following organization: '" + $scope.organization[NAME] + "'";
	};

	loadMembership();
});
