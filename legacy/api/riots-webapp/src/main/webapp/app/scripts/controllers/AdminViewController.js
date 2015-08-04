define(['app'], function(app) {
	app.controller('AdminViewController', [
		'$scope', '$http', '$compile', '$routeParams',
		function($scope, $http, $compile, $routeParams) {

			AppController($scope, $http, $compile);

		}
	]);
});
