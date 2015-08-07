angular.module('rioxApp').controller('ListDataPipesCtrl', function($scope, ngTableParams, $log) {

	console.log("Withing data pipes LIST controller");

	var loadTableParams = function () {
		var data = $scope.samplePipes;
		$scope.tableParams = new ngTableParams({
			page: 1,
			count: 10
		}, {
			total: data.length,
			getData: function ($defer, params) {
				var from = (params.page() - 1) * params.count();
				var to = params.page() * params.count();
				$defer.resolve(data.slice(from, to));
			}
		});
	};

	/*var loadAllPipes = $scope.loadAllPipes = function() {
		console.log("Loading pipes")
		riox.pipes({}, function(pipes) {
			console.log("Loaded PIPES: ", pipes)
			$log.debug('Loaded Pipes: ', pipes);
			$scope.pipes = pipes;
		});
	};
*/

//	loadAllPipes();
	loadTableParams();
});
