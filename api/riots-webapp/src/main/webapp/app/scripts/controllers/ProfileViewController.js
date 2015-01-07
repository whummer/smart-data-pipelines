define(['app'], function(app) {
    app.controller('ProfileViewController',
    	['$scope', '$http', '$compile', function($scope, $http, $compile) {
			AppController($scope, $http, $compile);

        }
    ]);
});
