angular.module('rioxApp').controller('ListDataPipesCtrl', function ($scope, ngTableParams, $log, growl) {

	console.log("Withing data pipes LIST controller");

	//
	// model for our data pipes
	//
	$scope.pipes = [];

	//
	// build a table view that displays a pageable list of pipes
	//
	$scope.tableParams = new ngTableParams({page: 1, count: 5}, {
		total: $scope.pipes.length,
		getData: function ($defer, params) {
			$log.debug("getData() called. Pipes: ", $scope.pipes);
			params.total($scope.pipes.length);
			$defer.resolve($scope.pipes.slice((params.page() - 1) * params.count(), params.page() * params.count()));
		}
	});

	//
	// helper to load all pipelines from backend
	//
	var loadAllPipes = function () {
		riox.pipes({}, function (pipes) {
			$log.debug('Loaded ' + pipes.length + ' pipes');
			$scope.pipes = pipes;
			$scope.tableParams.reload();
		}, function (error) {
			$log.error('Cannot load pipes: ', error);
			growl.error('Cannot load pipes. See console for details.');
		});
	};

	//
	// delete given pipeline and refresh pipes list
	//
	$scope.deletePipelineAndReload = function (pipeline) {
		$log.debug('DeleteAndReload');
		$scope.deletePipeline(pipeline, loadAllPipes);
	};

	//
	// populate view with data
	//
	loadAllPipes();

});
