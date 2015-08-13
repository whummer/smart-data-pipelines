angular.module("rioxApp").controller("DataPipesCtrl", function ($scope, $log, growl, $filter) {

	console.log("Withing data pipes PARENT controller");

	$scope.trim = window.trim;

	$scope.sources = [];
	$scope.sinks = [];
	$scope.processors = [];

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
			icon: "bars",
			elements : []
		}
	];


	//
	// load pipeline elements
	//
	$scope.loadPipelineElements = function () {
		$log.debug('Loading pipeline elements');
		riox.pipeelements({}, function (elements) {
			$log.debug('Loaded %s elements', elements.length);
			elements.forEach(function (element) {
				switch (element.type) {
					case 'source' :
						$scope.sources.push(element);
						break;
					case 'sink' :
						$scope.sinks.push(element);
						break;
					case 'processor' :
						$scope.processors.push(element);
						break;
					default:
						throw new Error('Unexpeced element type: ' + element.type);
				}
			});

            $scope.$apply();
		}, function(error) {
            if (error.status == 404) {
                $log.warn('No SmartBricks found in DB');
                growl.warning('No SmartBricks found. Please add one.');
            } else {
                $log.error('Cannot load SmartBricks: ', error);
                growl.error('Cannnot load SmartBricks. See console for details');
            }
        });
	};

	//
	// get the available options for the currently selected element
	//
	$scope.getAvailableOptions = function (selectedElement) {
		if (!selectedElement) return;
		//$log.debug('Getting available options for ', selectedElement.label);
		var template = getTemplatesForElement(selectedElement);
		$log.info('Got options: ', template.options);
		return template.options;
	};


	//
	// get the correct CSS class for given element
	//
	$scope.getClassForElement = function (element, size) {
		//$log.debug('Getting class for element ', element);
		if (element.type) {
			return element.type == 'container' ? 'element-container' : (size ? element.type + size : element.type);
		} else {
			return element.class == 'container' ? 'element-container' : 'element';
		}
	};

	//
	// get the font-awesome based icon for given element. Return the icon of the template if
    // element has no subtype yet
	//
	$scope.getElementIcon = function (element) {
		if (!element.subtype && element.icon) {
			return element.icon;
		}

		//$log.debug('Getting icon for element ', element);
		var template = getTemplatesForElement(element);
		return template.icon;
	};

	function getTemplatesForElement(element) {
		var elementsOfSelectedType = element.type == 'source' ?
				$scope.sources : element.type == 'sink' ?
				$scope.sinks : $scope.processors;

		//$log.warn('selected type: ', elementsOfSelectedType)
		return $filter('filter')(elementsOfSelectedType, {subtype: element.subtype})[0];
	}

	//
	// open datapipe definition in modal view
	//
	$scope.showPipelineDefinition = function (pipeline) {
		var pipelineDefinition = angular.toJson(pipeline, true);
		showDebugDialog("Here is what your pipeline looks like: ",
				"Definition of Pipeline '" + pipeline.name + "'",
				pipelineDefinition);
	};

	//
	// delete a pipeline
	//
	$scope.deletePipeline = function (pipeline, callback) {
		var deleteCallback = function () {
			riox.delete.pipe(pipeline.id, function () {
				growl.success('Deleted pipeline "' + pipeline.name + '"');
				callback();
			}, function (error) {
				$log.error('Cannot delete pipeline: ', error);
				growl.error('Cannot delete pipeline "' + pipeline.name + "'. See console for details");
			})
		};

		showConfirmDialog("Do you really want to delete pipline '" + pipeline.name + "'?", deleteCallback);
	};

	$scope.loadPipelineElements();

});
