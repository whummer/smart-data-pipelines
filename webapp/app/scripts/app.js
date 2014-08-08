function setLoadingStatus(status, text) {
	if(!status) {
		$("#loadingDiv").hide();
	} else {
		$("#loadingDiv").show();
		$("#loadingImg").prop("title", text);
	}
}

function renderElement(elementID) {
	$(document).ready(function() { 
		require(
			["dojo/parser", "dijit/registry", "dojo/domReady!"],
			function(parser, registry){
				var widget = registry.byId(elementID);
				if(!widget) {
					el = document.getElementById(elementID);
					widget = registry.byId(el.children[0].id);
				}
				if(widget) {
					widget.destroyRecursive();
				}
				parser.parse(elementID);
	    });
	});
}

define(['routes','services/dependencyResolverFor'], function(config, dependencyResolverFor)
{
	var app = angular.module('app', [
		'ngRoute'
	]);

	app.config(
	[
		'$routeProvider',
		'$locationProvider',
		'$controllerProvider',
		'$compileProvider',
		'$filterProvider',
		'$provide',

		function($routeProvider, $locationProvider, $controllerProvider, 
				$compileProvider, $filterProvider, $provide)
		{
			app.controller = $controllerProvider.register;
			app.directive  = $compileProvider.directive;
			app.filter	 = $filterProvider.register;
			app.factory	= $provide.factory;
			app.service	= $provide.service;

			$locationProvider.html5Mode(true);

			if(config.routes !== undefined) {
				angular.forEach(config.routes, function(route, path)
				{
					$routeProvider.when(path, {templateUrl:route.templateUrl, resolve:dependencyResolverFor(route.dependencies)});
				});
			}

			if(config.defaultRoutePaths !== undefined) {
				$routeProvider.otherwise({redirectTo:config.defaultRoutePaths});
			}

		}
	]);

   return app;
});