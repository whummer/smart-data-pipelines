
function consumerWizardCtrl($scope) {
	$scope.resourceData = {};
	$scope.formData = {};
	$scope.processForm = function () {
		alert('Wizard completed');
	};
	$scope.trim = window.trim;

	/* constants */
	var STATUS_REQUESTED = "REQUESTED";

	/* load streams */
	var loadStreams = function() {
		riox.streams.sources({}, function(streams) {
			$scope.$apply(function() {
				$scope.streams = streams;
				$.each(streams, function(idx, el) {
					$scope.prepareStream(el);
				});
			});
		});
	}

	loadStreams();

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

	$scope.requestAccess = function () {
		if (!$scope.formData.streamAccess || !$scope.formData.streamAccess.status) {
			var streamAccess = {
				status: STATUS_REQUESTED,
				streamId: $scope.formData.selectedStream.id
			};
			riox.save.access(streamAccess, function(streamAccess) {
				$scope.formData.streamAccess = streamAccess;
				$scope.formData.streamAccess.status = STATUS_REQUESTED;
				$scope.loadAccessStatus();
			});
		} else {
			$scope.formData.streamAccess.status = STATUS_REQUESTED;
		}
	};

	$scope.loadAccessStatus = function (callback) {
		var query = {
			streamId: $scope.formData.selectedStream.id
		};
		riox.access(query, function (access) {
			if(access[0]) {
				$scope.formData.streamAccess = access[0];
			} else {
				$scope.formData.streamAccess = {};
			}
			if (callback) {
				callback();
			}
		});
	};
}

angular.module('rioxApp').controller('consumerWizardCtrl', consumerWizardCtrl);
