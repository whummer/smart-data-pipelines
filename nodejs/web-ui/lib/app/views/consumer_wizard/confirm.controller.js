'use strict';

angular.module('rioxApp').controller(
	'ConsumerConfirmCtrl', function ($scope, Auth, $stateParams, $state, Formatter, $q) {

		$scope.format = Formatter;

		$scope.checkIfSourceSelected($stateParams); // call to parent controller

		$scope.finish = function () {
			var data = $scope.formData;
			var sink = {};
			var stream = {};
			var processor = {};
			var saveSink = function (resolve, reject) {
				sink[CONNECTOR] = data[CONNECTOR][TYPE];
				riox.add.streams.sink(sink, resolve, reject);
			};
			var saveProcessors = function (resolve, reject) {
				var mod = data.selectedAnalyticsModule;
				processor[TYPE] = mod._id;
				processor[PAYLOAD] = {};
				processor[PAYLOAD][INPUT] = mod[INPUT];
				processor[PAYLOAD][OUTPUT] = mod[OUTPUT];
				riox.add.streams.processor(processor, function (processor) {
					resolve([processor]);
				}, reject);
			};
			var saveStream = function (resolve, reject) {
				riox.add.stream(stream, resolve, reject);
			};
			var applyStream = function (resolve, reject) {
				var req = {};
				console.log("Stream (in apply) :", stream);
				req[STREAM_ID] = stream.id;
				riox.stream.apply(req, resolve, reject);
			};

			/* start promise chain */
			$q(saveSink).
				then(function (sink) {
					stream[SOURCE_ID] = data.selectedSource.id;
					stream[SINK_ID] = sink.id;
					return $q(saveProcessors);
				}).
				then(function (processors) {
					stream[PROCESSORS] = processors;
					console.log("Stream (before saveStream): ", stream);
					return $q(saveStream);
				}).
				then(function (stream1) {
					console.log("Stream1 : ", stream1);
					console.log("Stream (before applyStream): ", stream);
					stream.id = stream1._id;
					console.log("Stream (after assing): ", stream);
					return $q(applyStream);
				}).
				then(function (result) {
					console.log("Successfully created stream.", result);
				}, function (err) {
					console.log("An error has occurred", err);
				});
		};

	});
