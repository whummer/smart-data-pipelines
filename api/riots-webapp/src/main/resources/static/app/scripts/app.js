/* some shared globals */
var rootScope = null;
var eventBus = {
    publish: function (type, data) {
        /* use pub-sub from angularjs */
        rootScope.$broadcast(type, data);
    },
    subscribe: function (typeFilter, listener) {
        /* use pub-sub from angularjs */
        return rootScope.$on(typeFilter, function (filter, event) {
            listener(event);
        });
    },
    unsubscribe: function (handle) {
        /* handle is an angular de-registration function */
        handle();
    }
};
/* needed for code optimization (r.js) */
if (!window.angular) {
    angular = {};
}

define(
    [
        'routes', 'angular', 'angular-bootstrap',
        'bootstrap-tags',
        'angular-route', 'angular-ui-grid',
        'angular-ui-slider','bg-splitter'
    ],

    function (config) {

        var app = angular.module('app', [
            'bgDirectives',
            'ngRoute',
            'ui.bootstrap',
            'ui.grid',
            'ui.grid.edit',
            'ui.grid.rowEdit',
            'ui.grid.cellNav',
            'ui.grid.selection',
            'ui.grid.autoResize'
        ]);

        var dependencyResolverFor = function (defaultDependencies, dependencies, $http) {
            var definition = {
                resolver: ['$q', '$rootScope', function ($q, $rootScope) {
                    var deferred = $q.defer();

                    performLogin(function (authInfo) {
                        //console.log("Login done. Start rendering.", authInfo);

                        if (authInfo) {
                        	window.authInfo = authInfo;
                            var network = authInfo.network;
                            var token = authInfo.access_token;
                            $http.defaults.headers.common["riots-auth-network"] = network;
                            $http.defaults.headers.common["riots-auth-token"] = token;
                            dependencies = defaultDependencies.concat(dependencies);
                        } else {
                            dependencies = defaultDependencies;
                        }

                        require(dependencies, function () {
                            $rootScope.$apply(function () {
                                deferred.resolve();
                            });
                        });
                    });

                    return deferred.promise;
                }]
            }
            return definition;
        }

        app.config([
            '$routeProvider',
            '$locationProvider',
            '$controllerProvider',
            '$compileProvider',
            '$filterProvider',
            '$httpProvider',
            '$provide',

            function ($routeProvider, $locationProvider, $controllerProvider,
                      $compileProvider, $filterProvider, $httpProvider, $provide) {
                app.controller = $controllerProvider.register;
                app.directive = $compileProvider.directive;
                app.filter = $filterProvider.register;
                app.factory = $provide.factory;
                app.service = $provide.service;

                //$locationProvider.html5Mode(true);
                $locationProvider.html5Mode(false);

                if (config.routes !== undefined) {
                    angular.forEach(config.routes, function (route, path) {
                        $routeProvider.when(path, {
                            templateUrl: route.templateUrl,
                            resolve: dependencyResolverFor(
                                config.defaultDependencies, route.dependencies, $httpProvider)
                        });
                    });
                }

                if (config.defaultRoutePaths !== undefined) {
                    $routeProvider.otherwise({
                        redirectTo: config.defaultRoutePaths
                    });
                }
            }

        ]);

        app.controller('RootController', [
            '$scope', '$http', '$compile',
            function ($scope, $http, $compile) {
                if (rootScope == null) {
                    rootScope = $scope;
                    /* use this as "shared memory" between
                     controllers of different views. */
                    $scope.shared = {};
                    $scope.performLogout = function () {
                        performLogout();
                    };

                    $scope.hideSplashScreen = function () {
                        hideSplashScreen();
                    }
                }
            }
        ]);


        // automatically remove templates from angular cache when navigation routes
        app.run(function ($rootScope, $templateCache) {
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
                if (typeof(current) !== 'undefined') {
                    $templateCache.remove(current.templateUrl);
                }
            });
        });


        return app;
    });



