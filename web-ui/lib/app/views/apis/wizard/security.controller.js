
angular.module('rioxApp').controller('WizardSecurityCtrl', 
		function($scope, $log, $http, growl, Upload, $state) {

	var loadUserCerts = function() {
		$scope.userCertificates = [{
			id: "__new__",
			name: "-- Upload New --"
		}];
		riox.certificates(function(certs) {
			$scope.userCertificates = $scope.userCertificates.concat(certs);
		});
	};

	/* load elements */
	loadUserCerts();
});
