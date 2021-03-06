angular.module("rioxApp").controller("DataPipesCtrl", function ($scope, $log, growl, $filter, $state) {

	$log.debug("Withing data pipes PARENT controller");

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
			elements: []
		}
	];


	//
	// load pipeline elements
	//
	$scope.loadPipelineElements = function (query = {}) {
		$log.debug(`Loading pipeline elements. Query: ${query}`);

		riox.pipeelements(query,

			elements => {
				$log.debug('Loaded %s elements', elements.length);
				elements.forEach(function (element) {
					switch (element[CATEGORY]) {
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
							throw new Error('Unexpeced element category: ' + element[CATEGORY]);
					}
				});

				$scope.$apply();
			},

			error => {
				if (error.status == 404) {
					$log.warn('No Smart Pipes found in DB');
					growl.warning('No Smart Pipes found. You will not be able to create new Data Pipelines.');
				} else {
					$log.error(`Cannot load Smart Pipes: ${error}`);
					growl.error('Cannnot load Smart Pipes. See console for details');
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
		$log.info(`Got options: ${template.options}`);
		return template.options;
	};

	//
	// get the correct CSS class for given element
	//
	$scope.getClassForElement = function (element, size) {
		if (element[CATEGORY]) {
			return element[CATEGORY] == 'container' ? 'element-container' : 
					(size ? element[CATEGORY] + size : element[CATEGORY]);
		} else {
			return element.class == 'container' ? 'element-container' : 'element';
		}
	};

	//
	// get the font-awesome based icon for given element. Return the icon 
	// of the template if element has no type yet
	//
	$scope.getElementIcon = function (element) {
		if (!element[TYPE] && element.icon) {
			return element.icon;
		}

		//$log.debug('Getting icon for element ', element);
		var template = getTemplatesForElement(element);
		return template.icon;
	};

	function getTemplatesForElement(element) {
		var elementsOfSelectedType = element[CATEGORY] == 'source' ?
			$scope.sources : element[CATEGORY] == 'sink' ?
			$scope.sinks : $scope.processors;

		//$log.warn('selected type: ', elementsOfSelectedType)
		return $filter('filter')(elementsOfSelectedType, {type: element[TYPE]})[0];
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
		if(!callback) {
			callback = function() {
				$state.go('index.sdps.list');
			}
		}
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

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.sdps.list", name: "Pipelines" };
	}
	$scope.setNavPath($scope, $state);

	$scope.loadPipelineElements();

});
