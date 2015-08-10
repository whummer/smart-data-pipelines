angular.module('rioxApp').controller('EditDataPipeCtrl', function($scope, $filter, $stateParams) {

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
		var pipe =  $filter('filter')($scope.samplePipes, {pipeId: $stateParams.pipeId})[0];
		$scope.pipeline = pipe;
	}

	//
	// import existing pipeline definition (JSON)
	//
	$scope.importPipeline = function () {
		showEditorDialog("Paste the definition of your pipeline below", "Import Datapipe", {options:{mode:'json'}}, function (content) {
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
	// templates for datapipe elements
	//
	$scope.templates = [
		{
			type: "source",
			cssClass: 'pipeSource',
			icon: "download"
		},
		{
			type: "processor",
			cssClass: 'pipeProcessor',
			icon: "cog"
		},
		{
			type: "sink",
			cssClass: 'pipeSink',
			icon: "upload"
		}
	];

	$scope.sources = [
		{
			name: 'HTTP',
			icon: 'globe',
			availableOptions: [
				{name: 'URL', type: 'String'},
				{name: 'Interval', type: 'Number'}
			]
		},
		{
			name: 'Websocket',
			icon: 'globe fa-spin',
			availableOptions: [
				{name: 'URL', type: 'String'}
			]
		},

		{
			name: 'TwitterStream',
			icon: 'twitter',
			availableOptions: [
				{name: 'Follow', type: 'String'},
				{name: 'Track', type: 'String'}
			]
		},

		{
			name: 'TwitterSearch',
			icon: 'twitter-square',
			availableOptions: [
				{name: 'Query', type: 'String'},
				{name: 'Geocode', type: 'String'}
			]
		}
	];

	$scope.processors = [
		{
			name: 'Aggregator',
			icon: 'share-alt fa-flip-horizontal',
			availableOptions: []
		},
		{
			name: 'Filter',
			icon: 'filter',
			availableOptions: []
		},
		{
			name: 'Splitter',
			icon: 'share-alt',
			availableOptions: []
		},
		{
			name: 'Transform',
			icon: 'gears',
			availableOptions: []
		}
	];

	$scope.analytics = [];

	$scope.sinks = [
		{
			name: 'Map Visualization',
			icon: 'map-o',
			availableOptions: []
		},

		{
			name: 'Table Visualization',
			icon: 'table',
			availableOptions: []
		},


		{
			name: 'Logfile',
			icon: 'file-text-o',
			availableOptions: [
				{
					name: 'LogfileName',
					type: 'String'
				}
			]
		}
	];

	//
	// save pipeline via service call
	//
	$scope.submitDatapipe = function () {
		$scope.updateDatapipeDefinition();
	};

	//
	// open datapipe definition in modal view
	//
	$scope.updateDatapipeDefinition = function () {
		var pipelineDefinition = angular.toJson($scope.pipeline, true);
		console.log('Submitting: ', pipelineDefinition);
		$scope.pipelineDefinition = pipelineDefinition;
		showDebugDialog("Here is what your pipeline looks like: ",
			"Definition of Pipeline '" + $scope.pipeline.name + "'",
			pipelineDefinition);
	};

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

});
