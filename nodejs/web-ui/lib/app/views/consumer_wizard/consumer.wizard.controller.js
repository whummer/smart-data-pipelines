function consumerWizardCtrl($scope, $stateParams, $state) {
	$scope.resourceData = {};
	$scope.formData = {};
	$scope.trim = window.trim;

	$scope.selectItem = function(sourceId) {
		$state.go("consumer.wizard.request", {
			sourceId : sourceId
		});
	};

	if ($state.params.debug) {
		$scope.debug = true;
	}

	/* load sources */
	var loadSources = function() {
		riox.streams.sources({}, function(sources) {
			$scope.$apply(function() {
				$scope.sources = sources;
				$.each(sources, function(idx, el) {
					$scope.prepareStreamSource(el);
				});
			});
		});
	}

	$scope.isAccessGranted = function() {
		var src = $scope.formData.selectedSource;
		if(!src) return false;
		if(src[PERMIT_MODE][TYPE] == PERMIT_MODE_AUTO) return true;
		var access = $scope.formData.sourceAccess;
		if(!access) return false;
		if(access.STATUS_PERMITTED) return true;
		return false;
	};

	/* load main elements */
	loadSources();

}

angular.module('rioxApp').controller('consumerWizardCtrl', consumerWizardCtrl);
