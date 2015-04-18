
function consumerWizardCtrl($scope) {
	$scope.resourceData = {};
	$scope.formData = {};
	$scope.processForm = function () {
		alert('Wizard completed');
	};
	$scope.trim = window.trim;

	/* load streams */
	riox.streams({}, function(streams) {
		$scope.$apply(function() {
			$scope.streams = streams;
			$.each(streams, function(idx, el) {
				if(el[ORGANIZATION_ID]) {
					riox.organization(el[ORGANIZATION_ID], function(org) {
						if(org[IMAGE_DATA] && org[IMAGE_DATA][0]) {
							el.organizationImg = org[IMAGE_DATA][0].href;
						}
						el.organization = org;
					});
				}
			});
		});
	});

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
		if (!$scope.formData.streamAccess) {
			var streamAccess = {
				status: "requested",
				streamId: $scope.formData.selectedStream.id
			};
			riox.save.access(streamAccess, function(streamAccess) {
				$scope.formData.streamAccess = streamAccess;
				$scope.formData.streamAccess.status = "requested";
				$scope.loadAccessStatus();
			});
		} else {
			$scope.formData.streamAccess.status = "requested";
		}
	};

	$scope.loadAccessStatus = function (callback) {
		var query = {
			streamId: $scope.formData.selectedStream.id
		};
		riox.access(query, function (access) {
			$scope.formData.streamAccess = access;
			if (callback) {
				callback();
			}
		});
	};
}

angular.module('rioxApp').controller('consumerWizardCtrl', consumerWizardCtrl);
