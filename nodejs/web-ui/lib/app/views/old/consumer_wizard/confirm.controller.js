'use strict';

angular.module('rioxApp').controller(
'ConsumerConfirmCtrl', function ($scope, Auth, $stateParams, $state, Formatter, $q) {

	$scope.format = Formatter;

	$scope.checkIfSourceSelected($stateParams); // call to parent controller

	$scope.getSelectedAnalyticsName = function() {
		if(!$scope.formData.selectedAnalyticsModule) {
			$scope.formData.selectedAnalyticsModule = $scope.DFLT_ANALYTICS_FUNCTION;
		}
		if($scope.formData.selectedAnalyticsModule.id) {
			return "Function '" + $scope.formData.selectedAnalyticsModule.name + "'";
		}
		return $scope.formData.selectedAnalyticsModule.name;
	}

	$scope.finish = function() {
		var data = $scope.formData;
		var cfg = {};
		cfg.stream = {};
		var saveSink = function(resolve, reject) {
			var sink = {};
			sink[CONNECTOR] = data[CONNECTOR][TYPE];
			sink[ORGANIZATION_ID] = Auth.getCurrentOrganization().id;
			riox.add.streams.sink(sink, resolve, reject);
		};
		var saveProcessors = function(resolve, reject) {
			var mod = data.selectedAnalyticsModule;
			var processor = {};
			processor[TYPE] = mod._id;
			processor[PAYLOAD] = {};
			processor[PAYLOAD][INPUT] = mod[INPUT];
			processor[PAYLOAD][OUTPUT] = mod[OUTPUT];
			riox.add.streams.processor(processor, function(processor) {
				resolve([processor]);
			}, reject);
		};
		var saveStream = function(resolve, reject) {
			riox.add.stream(cfg.stream, resolve, reject);
		};
		var applyStream = function(resolve, reject) {
			var req = {};
			req[STREAM_ID] = cfg.stream.id;
			console.log("applying stream", req, cfg.stream);
			riox.stream.apply(req, resolve, reject);
		};

		/* start promise chain */
		$q(saveSink).
		then(function(sink) {
			cfg.stream[SOURCE_ID] = data.selectedSource.id;
			cfg.stream[SINK_ID] = sink.id;
			return $q(saveProcessors);
		}).
		then(function(processors) {
			cfg.stream[PROCESSORS] = processors;
			return $q(saveStream);
		}).
		then(function(stream) {
			cfg.stream = stream;
			console.log("saved stream", stream);
			return $q(applyStream);
		}).
		then(function(result) {
			console.log("Successfully created stream.", result);
		},function(err) {
			console.log("An error has occurred", err);
		});
	};

});
