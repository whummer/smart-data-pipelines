'use strict';

angular.module('rioxApp', [
	'ui.router',
	'ui.bootstrap',
	'leaflet-directive'
])
.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	$locationProvider.html5Mode(false);
});
