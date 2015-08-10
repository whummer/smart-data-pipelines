angular.module('rioxApp').controller('ListDataPipesCtrl', function($scope, ngTableParams) {

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

	loadTableParams();
});
