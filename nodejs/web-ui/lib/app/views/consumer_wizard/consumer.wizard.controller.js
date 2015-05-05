
function consumerWizardCtrl($scope, $stateParams, $state) {
	$scope.resourceData = {};
	$scope.formData = {};
	$scope.trim = window.trim;

	$scope.selectItem = function(sourceId) {
		$state.go("consumer.wizard.request", {sourceId: sourceId});
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

	$scope.producersAutocomp = {
		options: {
			html: true,
			focusOpen: true,
			valueList: [
				{id: 1, label: "BMW"},
				{id: 2, label: "Volkswagen"},
				{id: 3, label: "Smart City Vienna"}
			],
			source: function (request, response) {
				console.log(request);
				response($scope.producersAutocomp.options.valueList);
			}
		}
	};

	/* load main elements */

	loadSources();

}

angular.module('rioxApp').controller('consumerWizardCtrl', consumerWizardCtrl);
