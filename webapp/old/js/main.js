var app = angular.module('app',["ngRoute"]);
app.config(['$routeProvider', '$controllerProvider',
    function($routeProvider, $controllerProvider) {
        // remember mentioned function for later use
        app.registerCtrl = $controllerProvider.register;
        //your routes
        $routeProvider.when('/', {templateUrl: 'partials/home.html'});
        $routeProvider.when('/login', {templateUrl: 'partials/login.html'});
        $routeProvider.otherwise({redirectTo: '/'});
    }
]);
