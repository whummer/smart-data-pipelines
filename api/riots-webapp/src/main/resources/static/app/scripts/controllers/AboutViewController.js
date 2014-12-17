define(['app'], function(app) {
    app.controller('AboutViewController', [
        '$scope', '$http', '$compile',
		function($scope, $http, $compile) {

			AppController($scope, $http, $compile);

			rootScope.menuItemActiveClass = { about: "menuItemActive" }

        }
    ]);
});