'use strict';

angular.module('rioxApp')
.controller('SettingsSecurityCtrl', function ($scope, growl) {

	$scope.selected = {};

	var loadCertificates = function() {
		delete $scope.selected.cert;
		riox.certificates(function(certs) {
			$scope.certificates = certs;
		});
	};

	$scope.addCert = function() {
		var cert = {};
		riox.add.certificate(cert, function(cert) {
			loadCertificates();
			//$scope.selected.cert = cert;
		});
	};
	$scope.saveCert = function() {
		if(!$scope.selected.cert) return;
		riox.save.certificate($scope.selected.cert, function(cert) {
			$scope.selected.cert = cert;
			growl.info("Certificate details saved.");
		});
	};
	$scope.deleteCert = function(cert) {
		riox.delete.certificate(cert, function(cert) {
			loadCertificates();
			growl.info("Certificate permanently deleted.");
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings.security", name: "Security" };
	}
	$scope.setNavPath($scope);

	/* load main elements */
	loadCertificates();
});
