'use strict';

angular.module('rioxApp', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ui.router',
	'ui.bootstrap',					  // Bootstrap
	'ui.sortable',					  // sortable (draggable items)
	'ui.autocomplete',				  // autocomplete
	'localytics.directives',		  // Chosen select
	'NgSwitchery',
	'angular-growl',
	'ngAnimate',
	'hljs',
	'ui.ace',
	'ngFileUpload',
	'ngTagsInput',
	'ng-alias',
	'angucomplete',
	'oc.lazyLoad',
	'chart.js',
	'ngTable',
	'leaflet-directive',

	'riox-map-leaflet',
	'riox-table',
	'riox-timeseries',

	'dndLists' // drag and drop stuff
])
		.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, growlProvider) {
			$locationProvider.html5Mode(false);
			$httpProvider.interceptors.push('authInterceptor');
			growlProvider.globalTimeToLive(5000);
		})

		.factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
			return {
				// Add authorization token to headers
				request: function (config) {
					config.headers = config.headers || {};
					if ($cookieStore.get('token')) {
						config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
					}
					return config;
				},

				// Intercept 401s and redirect you to login
				responseError: function (response) {
					if (response.status === 401) {
						$location.path('/login');
						// remove any stale tokens
						$cookieStore.remove('token');
						return $q.reject(response);
					}
					else {
						return $q.reject(response);
					}
				}
			};
		})

		.run(function ($rootScope, $state, Auth) {

			 $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

					var authRequired = toState.authenticate || (toState.data && toState.data.authenticate);
					if($rootScope.stateChangeBypass || toState.name === 'index.login' || !authRequired) {
					$rootScope.stateChangeBypass = false;
					return;
				}

				event.preventDefault();
				Auth.isLoggedInAsync(function(user) {
					if (user) {
						 $rootScope.stateChangeBypass = true;
						 $state.go(toState, toParams);
					} else {
						 $state.go('index.login');
					}
				});
			 });
		});
