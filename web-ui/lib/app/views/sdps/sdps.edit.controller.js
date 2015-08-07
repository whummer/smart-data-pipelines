angular.module('rioxApp').controller('EditDataPipeCtrl', function ($scope, $filter, $stateParams, growl, $log) {

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
		$scope.pipeline = $scope.samplePipes[0]; //$filter('filter')($scope.samplePipes, {pipeId: $stateParams.pipeId})[0];
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
	// templates for datapipe elements
	//
	$scope.templates = [

		{
			label: "Source",
			class: "element",
			type: 'source',
			icon: "download"
		},
		{
			label: "Processor",
			class: "element",
			type: 'processor',
			icon: "cog"
		},
		{
			label: "Sink",
			class: "element",
			type: 'sink',
			icon: "upload"
		},
		{
			label: "Container",
			class: "container",
			//type : "element-container",
			icon: "bars"
		}
	];

	$scope.sources = [
		{
			name: 'HTTP',
			type: 'http-out',
			icon: 'globe',
			options: [
				{name: 'url', type: 'String'},
				{name: 'method', type: 'String'},
				{name: 'interval', type: 'Number'}
			]
		},
		{
			name: 'Websocket',
			type: 'websocket-out',
			icon: 'globe fa-spin',
			options: [
				{name: 'url', type: 'String'}
			]
		},

		{
			name: 'Twitter Stream',
			type: 'twitter-stream',
			icon: 'twitter',
			options: [
				{name: 'follow', type: 'String'},
				{name: 'track', type: 'String'}
			]
		},

		{
			name: 'Twitter Search',
			type: 'twitter-search',
			icon: 'twitter-square',
			options: [
				{name: 'query', type: 'String'},
				{name: 'geocode', type: 'String'}
			]
		}
	];

	$scope.processors = [
		{
			name: 'Aggregator',
			type: 'aggregator',
			icon: 'share-alt fa-flip-horizontal',
			options: []
		},
		{
			name: 'Filter',
			type: 'filter',
			icon: 'filter',
			options: []
		},
		{
			name: 'Splitter',
			type: 'splitter',
			icon: 'share-alt',
			options: []
		},
		{
			name: 'Transformer',
			type: 'transformer',
			icon: 'gears',
			options: []
		},
		{
			name: 'Script',
			type: 'script',
			icon: 'code',
			options: [
				{'name': 'location', type: 'String', 'description': 'location of script file (e.g. URL)'},
				{'name': 'sync-interval', type: 'Number', 'description': 'seconds between refresh from script location'}
			]
		}
	];

	$scope.analytics = [];

	$scope.sinks = [
		{
			name: 'Map Visualization',
			type: 'map',
			icon: 'map-o',
			options: []
		},

		{
			name: 'Table Visualization',
			type: 'table',
			icon: 'table',
			options: []
		},

		{
			name: 'Logfile',
			type: 'file',
			icon: 'file-text-o',
			options: [
				{name: 'LogfileName', type: 'String'}
			]
		}
	];

	//
	// get the available options for the currently selected element
	//
	$scope.getAvailableOptions = function (selectedElement) {
		if (!selectedElement) return;
		$log.debug('Getting available options for ', selectedElement.label);
		var template = getTemplatesForElement(selectedElement);
		$log.info('Got options: ', template.options);
		return template.options;
	};


	$scope.getClassForElement = function (element) {
		$log.debug('Getting class for element ', element);
		if (element.type) {
			return element.type == 'container' ? 'element-container' : element.type;
		} else {
			return element.class == 'container' ? 'element-container' : 'element';
		}
	};

	//
	// get the font-aawesome based icon for given element
	//
	$scope.getElementIcon = function (element) {
		$log.debug('Getting icon for element ', element);
		var template = getTemplatesForElement(element);
		return template.icon;
	};

	function getTemplatesForElement(element) {
		var elementsOfSelectedType = element.type == 'source' ?
				$scope.sources : element.type == 'sink' ?
				$scope.sinks : $scope.processors;

		return $filter('filter')(elementsOfSelectedType, {type: element.subtype})[0];
	}


	//
	// save pipeline via service call
	//
	$scope.submitDatapipe = function () {
		var payload = angular.copy($scope.pipeline);
		delete payload.elements[0].config.availableOptions;
		delete payload.elements[0].config.icon;

		riox.add.pipe(angular.toJson(payload), function (response) {
			growl.info("Datapipe saved successfully.");
		});
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

	$scope.clearCanvas = function () {
		$scope.pipeline.elements = [];
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
