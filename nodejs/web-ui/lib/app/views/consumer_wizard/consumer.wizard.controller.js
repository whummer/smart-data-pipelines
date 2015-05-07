function consumerWizardCtrl($scope, $state, Formatter) {
	$scope.resourceData = {};
	$scope.formData = {};
	$scope.trim = window.trim;
	$scope.format = Formatter;

	$scope.steps = ["consumer.wizard.catalog", 
	                "consumer.wizard.request",
	                "consumer.wizard.connector",
	                "consumer.wizard.analytics",
	                "consumer.wizard.confirm"];
	$scope.state = $state;

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
		if(src[PERMIT_MODE] && src[PERMIT_MODE][TYPE] == PERMIT_MODE_AUTO) return true;
		var access = $scope.formData.sourceAccess;
		if(!access) return false;
		if(access[STATUS] == STATUS_PERMITTED) return true;
		return false;
	};

	$scope.nextStep = function() {
		var idx = $scope.steps.indexOf($state.current.name);
		$state.go($scope.steps[idx + 1]);
	};

	$scope.isAfterCurrent = function(someState) {
		if(someState.substring(0, 1) == ".") {
			someState = "consumer.wizard" + someState;
		}
		var someIdx = $scope.steps.indexOf(someState);
		var currentIdx = $scope.steps.indexOf($state.current.name);
		return someIdx > currentIdx;
	};

	$scope.checkIfSourceSelected = function($stateParams) {
		var indexState = "consumer.wizard.catalog";
		console.log("$stateParams.sourceId", $state.current.name, JSON.stringify($stateParams), $stateParams, $state);
		if(!$scope.formData.selectedSource && !$stateParams.sourceId 
				&& $state.current.name != indexState) {
			$state.go(indexState);
		}
	};

	/* load main elements */
	loadSources();

}

angular.module('rioxApp').controller('consumerWizardCtrl', consumerWizardCtrl);
