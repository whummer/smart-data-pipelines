define(['app'], function(app){
	app.controller('HomeViewController', [
		'$scope', '$http', '$compile',
		function($scope, $http, $compile) {
			AppController($scope, $http, $compile);
			$scope.statsAPI = appConfig.services.stats.url;
			$scope.highlightMenuItem("#menuItemDashboard");
        }
	]);
});