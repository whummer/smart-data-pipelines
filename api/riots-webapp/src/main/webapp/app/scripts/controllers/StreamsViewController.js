define(['app'], function(app) {
	app.controller('StreamsViewController', [
		'$scope', '$http', '$compile', '$routeParams',
		function($scope, $http, $compile, $routeParams) {

			AppController($scope, $http, $compile);

		}
	]);
});
