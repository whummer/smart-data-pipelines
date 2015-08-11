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
				riox.pipes($stateParams.pipeId, function (pipe) {
					$scope.pipeline = pipe;
					$scope.$apply();
				}, function (error) {
					$log.error('Cannot load pipe %s for editing: %s', $stateParams.pipeId, error);
					growl.error('Cannot load pipe. See console for details');
				});
			}

			//
			// import existing pipeline definition (JSON)
			//
			$scope.importPipeline = function () {
				showEditorDialog("Paste the definition of your pipeline below", "Import Datapipe", {options: {mode: 'json'}}, function (content) {
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
				delete payload.__v;
				delete payload._id;
				if ($scope.pipeline._id) {
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
			// delete given pipeline and go to listview
			//
			$scope.deletePipelineAndShowList = function (pipeline) {
				$scope.deletePipeline(pipeline, function () {
					$location.path('/sdps/sdps/list'); // todo check routes, somethings wrong here
				});
			};

			$scope.$watch('sources', function () {
				$log.debug("Sources changed: ", $scope.sources);
			});

			//
			// drag and drop helpers, debugging
			//
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
