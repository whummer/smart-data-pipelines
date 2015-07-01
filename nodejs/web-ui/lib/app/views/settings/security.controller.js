'use strict';

angular.module('rioxApp')
.controller('SettingsSecurityCtrl', function ($scope, $state, growl) {

	$scope.selected = {};
	$scope.resourceData = {};

	var loadCertificates = function() {
		delete $scope.selected.cert;
		riox.certificates(function(certs) {
			$scope.$apply(function() {
				$scope.certificates = certs;
			});
		});
	};

	$scope.addCert = function() {
		var cert = { name: "New Certificate" };
		riox.add.certificate(cert, function(cert) {
			loadCertificates();
		});
	};
	$scope.saveCert = function() {
		if(!$scope.selected.cert) return;
		$scope.selected.cert[CERT_FILE] = $scope.resourceData.certCRT;
		$scope.selected.cert[PK_FILE] = $scope.resourceData.certKEY;
		$scope.selected.cert[NAME] = $scope.resourceData.certName;
		riox.save.certificate($scope.selected.cert, function(cert) {
			$scope.selected.cert = cert;
			growl.info("Certificate details saved.");
		});
	};
	$scope.deleteCert = function(cert) {
		showConfirmDialog("Do you really want to permanently delete this certificate? WARNING: This action cannot be undone.", function() {
			riox.delete.certificate(cert, function(cert) {
				loadCertificates();
				growl.info("Certificate permanently deleted.");
			});
		});
	};
	$scope.selectCert = function(cert) {
		$scope.selected.cert = cert;
		$scope.resourceData = {};
		$scope.resourceData.certCRT = cert[CERT_FILE];
		$scope.resourceData.certKEY = cert[PK_FILE];
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.settings.security", name: "Security" };
	}
	$scope.setNavPath($scope, $state);

	/* load main elements */
	loadCertificates();
});
