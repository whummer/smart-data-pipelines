angular.module('rioxApp').controller('EditDataPipeCtrl', function ($scope, $filter, $stateParams, growl, $log, $location) {

		console.log("Withing data pipes EDIT controller");

		//
		// the container for our pipeline elements
		//
		$scope.pipeline = {
			elements: []
		};

		//
		// edit existing pipeline
		//
		if ($stateParams.pipeId) {
			loadPipeById($stateParams.pipeId);
		}

		//
		// import existing pipeline definition (JSON)
		//
		$scope.importPipeline = function () {
			showEditorDialog(
				"Paste the definition of your pipeline below",
				"Import Datapipe", {options: {mode: 'json'}}, function (content) {
					console.log("Got EditorContent: ", content);
					$scope.pipeline = angular.fromJson(content);
				});
		};

		//
		// the selected datapipe element (when user clicks element)
		//
		$scope.selectedItem = null;

		$scope.selectItem = function (item) {
			$scope.selectedItem = item;
		};

		//
		// save pipeline via service call. if _id property is present its a persistent pipe
		//
		$scope.submitDatapipe = function () {
			var payload = angular.copy($scope.pipeline);
			if ($scope.pipeline.id) {
				riox.save.pipe(payload, function (response) {
					$log.info('Updated datapipe. Response: ', response);
					growl.info("Datapipe updated successfully.");
				});
			} else {
				riox.add.pipe(payload, function (response) {
					$log.info('Saved datapipe. Response: ', response);
					growl.info("Datapipe saved successfully.");
				});
			}
		};

		//
		// remove all elements from pipeline canvas
		//
		$scope.clearCanvas = function () {
			$scope.pipeline.elements = [];
		};

		//
		// revert all changes to current pipeline
		//
		$scope.revertChanges = function(pipeline) {
			$log.debug('Reverting all changes to pipeline ', pipeline.name);
			loadPipeById(pipeline.id, 'Reverted Changes');
		};

		//
		// delete given pipeline and go to listview
		//
		$scope.deletePipelineAndShowList = function (pipeline) {
			$scope.deletePipeline(pipeline, function () {
				$location.path('/sdps/sdps/list'); // todo check routes, somethings wrong here
			});
		};

		//
		// load pipeline by ID
		//
		function loadPipeById(pipeId, message) {
			riox.pipes(pipeId, function (pipe) {
				$scope.pipeline = pipe;
				$scope.$apply();
				if (message) {
					growl.info(message);
				}
			}, function (error) {
				$log.error('Cannot load pipe %s for editing: %s', pipeId, error);
				growl.error('Cannot load pipe. See console for details');
			});
		}

		//
		// assign UUIDs (iff there is none) to element when they are dropped on the canvas
		//
		$scope.assignUUID = function(event, index, item) {
			var uuid = window.uuid.v4();
			if (!item.uuid) {
				$log.debug("Assigning UUID '" + uuid + ' to element ' + item.subtype);
				item.uuid = uuid;
			}

			return item;
		};

		//
		// drag and drop helpers, debugging
		//
		$scope.$watch('sources', function () {
			$log.debug("Sources changed: ", $scope.sources);
		});

		$scope.dragoverCallback = function (event, index, external, type) {
			$scope.logListEvent('dragged over', event, index, external, type);
			return index > 0;
		};

		$scope.dropCallback = function (event, index, item, external, type, allowedType) {
			$scope.logListEvent('dropped at', event, index, external, type);
			if (external) {
				if (allowedType === 'itemType' && !item.label) return false;
				if (allowedType === 'containerType' && !angular.isArray(item)) return false;
			}
			return item;
		};

		$scope.logEvent = function (message, event) {
			console.log(message, '(triggered by the following', (event ? event.type : ' UNKNOWN'), 'event)');
			console.log(event);
		};

		$scope.logListEvent = function (action, event, index, external, type) {
			var message = external ? 'External ' : '';
			message += type + ' element is ' + action + ' position ' + index;
			$scope.logEvent(message, event);
		};
	}
);
