/* some shared globals */
var API_CACHE_DEFAULT = true;
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
		'routes', 'bootstrap', 'angular-bootstrap', 'bootstrap-tagsinput', 'angular-growl',
		'angular-route', 'angular-ui-grid', 'infinite-scroll',
		'angular-hotkeys', 'd3', 'angular-animate', 'angular-bootstrap-checkbox', 'metisMenu', 'iCheck',
		'slimscroll', 'jasny-bootstrap', 'angular-ui-tree', 'angular-notify', 'fancybox', 'riots/auth', 'jvectormap'
	],

	function (config) {

		var app = angular.module('app', [
		    'ng',
			'ngRoute',
			'ngAnimate',
			'ui.bootstrap',
			'ui.grid',
			'ui.grid.edit',
			'ui.grid.rowEdit',
			'ui.grid.cellNav',
			'ui.grid.selection',
			'ui.grid.autoResize',
			'infinite-scroll',
			'cfp.hotkeys',
			'angular-growl',
			'ui.checkbox',                  // Custom checkbox
			//'ui.knob',                      // Knob input
			//'ui.switchery',                 // iOS7 swich style
			//'angular-peity',                // Peity charts
			//'easypiechart',                 // Easy pie charts
			//'angular-flot',                 // Flot charts
			//'angular-rickshaw',             // Rickshaw carts
			//'summernote',                   // Text editor
			//'nouislider',                   // Slider
			//'datePicker',                   // Datapicker
			//'datatables',                   // Dynamic tables
			//'localytics.directives',        // Chosen select
			//'angles',                       // Charts js
			//'ui.map',                       // Google maps
			//'ngGrid',                       // ngGrid
			//'ui.codemirror',                // Code editor
			'ui.tree',                      // Nestable list
			'cgNotify'                     // Angular notify
		]);

		var dependencyResolverFor = function (defaultDependencies, dependencies, $http) {
			var definition = {
				resolver: ['$q', '$rootScope', function ($q, $rootScope) {
					var deferred = $q.defer();

					console.log("$scope.isUnprotectedPage", rootScope.isUnprotectedPage);

					performLogin(function (authInfo) {
						console.log("Login done. Start rendering.", authInfo);

						if (authInfo) {
							window.authInfo = authInfo;
							rootScope.authInfo = authInfo;
							rootScope.loadUserInfo();
							var network = authInfo.network;
							var token = authInfo.access_token;
							$http.defaults.headers.common["riots-auth-network"] = network;
							$http.defaults.headers.common["riots-auth-token"] = token;
							if (defaultDependencies) {
								dependencies = defaultDependencies.concat(dependencies);
							}
						} else {
							$("#authContainer").show();
							dependencies = defaultDependencies;

							if(!rootScope.isUnprotectedPage) {
								if(window.location.href.indexOf("/#/login") < 0) {
						    		window.location.href = "/#/login";
						    		window.location.reload(true);
						    		return;
						    	}
							}
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
			'$animateProvider',
			'$provide',

			function ($routeProvider, $locationProvider, $controllerProvider,
					  $compileProvider, $filterProvider, $httpProvider, $animateProvider, $provide) {

				app.controller = $controllerProvider.register;
				app.directive = $compileProvider.directive;
				app.filter = $filterProvider.register;
				app.factory = $provide.factory;
				app.service = $provide.service;
				app.animate = $animateProvider.service;

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
			'$scope', '$http', '$compile', 'growl', '$location',
			function ($scope, $http, $compile, growl, $location) {
				if (rootScope == null) {
					rootScope = $scope;
					rootScope.http = $http;
					rootScope.growl = growl;
					rootScope.appConfig = appConfig;
					/* use this as "shared memory" between
					 controllers of different views. */
					$scope.shared = {};
					$scope.performLogout = function () {
						performLogout();
					};


					$scope.loadUserInfo = function() {
						$scope.userInfo = null;
						console.log("Loading user profile.", $scope.authInfo);
						if($scope.authInfo) {
							riots.me(function(me) {
								$scope.userInfo = me;
							}, function(error) {
								console.log(error);
								//$scope.growlInfo("Cannot load user profile.");
							});
						}
					};

					$scope.isUnprotectedPage = false;
					if($location.$$path.indexOf("/activate") == 0 ||
							$location.$$path.indexOf("/signup") == 0 ||
							$location.$$path.indexOf("/login") == 0) {
						$scope.isUnprotectedPage = true;
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


		/**
		 * INSPINIA - Responsive Admin Theme
		 * Copyright 2014 Webapplayers.com
		 *
		 * Main directives.js file
		 * Define directives for used plugin
		 *
		 *
		 * Functions (directives)
		 *  - pageTitle
		 *  - sideNavigation
		 *  - iboxTools
		 *  - minimalizaSidebar
		 *  - vectorMap
		 *  - morrisArea
		 *  - morrisBar
		 *  - morrisLine
		 *  - morrisDonut
		 *  - sparkline
		 *  - icheck
		 *  - ionRangeSlider
		 *  - dropZone
		 *  - fancyBox
		 *  - responsiveVideo
		 *
		 */


		/**
		 * pageTitle - Directive for set Page title - mata title
		 */
		function pageTitle($rootScope, $timeout) {
			return {
				link: function(scope, element) {
					var listener = function(event, toState, toParams, fromState, fromParams) {
						// Default title - load on Dashboard 1
						var title = 'INSPINIA | Responsive Admin Theme';
						// Create your own title pattern
						if (toState.data && toState.data.pageTitle) title = 'INSPINIA | ' + toState.data.pageTitle;
						$timeout(function() {
							element.text(title);
						});
					};
					$rootScope.$on('$stateChangeStart', listener);
				}
			}
		};

		/**
		 * sideNavigation - Directive for run metsiMenu on sidebar navigation
		 */
		function sideNavigation() {
			return {
				restrict: 'A',
				link: function(scope, element) {
					// Call the metsiMenu plugin and plug it to sidebar navigation
					element.metisMenu();
				}
			};
		};

		/**
		* iboxTools - Directive for iBox tools elements in right corner of ibox
		*/
		function iboxTools($timeout) {
			return {
				restrict: 'A',
				scope: true,
				templateUrl: 'views/common/ibox_tools.html',
				controller: function ($scope, $element) {
					// Function for collapse ibox
					$scope.showhide = function () {
						var ibox = $element.closest('div.ibox');
						var icon = $element.find('i:first');
						var content = ibox.find('div.ibox-content');
						content.slideToggle(200);
						// Toggle icon from up to down
						icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
						ibox.toggleClass('').toggleClass('border-bottom');
						$timeout(function () {
							ibox.resize();
							ibox.find('[id^=map-]').resize();
						}, 50);
					},
						// Function for close ibox
							$scope.closebox = function () {
								var ibox = $element.closest('div.ibox');
								ibox.remove();
							}
				}
			};
		};

		/**
		 * minimalizaSidebar - Directive for minimalize sidebar
		 */
		function minimalizaSidebar($timeout) {
			return {
				restrict: 'A',
				template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
				controller: function ($scope, $element) {
					$scope.minimalize = function () {
						$("#riots-logo-lg").toggleClass("hidden");
						$("body").toggleClass("mini-navbar");
						if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
							// Hide menu in order to smoothly turn on when maximize menu
							$('#side-menu').hide();
							// For smoothly turn on menu
							setTimeout(
									function () {
										$('#side-menu').fadeIn(500);
									}, 100);
						} else if ($('body').hasClass('fixed-sidebar')){
							$('#side-menu').hide();
							setTimeout(
									function () {
										$('#side-menu').fadeIn(500);
									}, 300);
						} else {
							// Remove all inline style from jquery fadeIn function to reset menu state
							$('#side-menu').removeAttr('style');
						}
					}
				}
			};
		};

		/*
		* vectorMap - Directive for Vector map plugin
		*/
		function vectorMap() {
			return {
				restrict: 'A',
				scope: {
					myMapData: '='
				},
				link: function (scope, element, attrs) {
					element.vectorMap({
						map: 'world_mill_en',
						backgroundColor: "transparent",
						regionStyle: {
							initial: {
								fill: '#e4e4e4',
								"fill-opacity": 0.9,
								stroke: 'none',
								"stroke-width": 0,
								"stroke-opacity": 0
							}
						},
						series: {
							regions: [
								{
									values: scope.myMapData,
									scale: ["#4a96ad", "#952c51"],
									normalizeFunction: 'polynomial'
								}
							]
						}
					});
				}
			}
		}
		//
		//
		///**
		// * morrisArea - Directive for Morris chart - type Area
		// */
		//function morrisArea() {
		//	return {
		//		restrict: 'A',
		//		scope: {
		//			chartOptions: '='
		//		},
		//		link: function(scope, element, attrs) {
		//			var chartDetail = scope.chartOptions;
		//			chartDetail.element = attrs.id;
		//			var chart = new Morris.Area(chartDetail);
		//			return chart;
		//		}
		//	}
		//}
		//
		///**
		// * morrisBar - Directive for Morris chart - type Bar
		// */
		//function morrisBar() {
		//	return {
		//		restrict: 'A',
		//		scope: {
		//			chartOptions: '='
		//		},
		//		link: function(scope, element, attrs) {
		//			var chartDetail = scope.chartOptions;
		//			chartDetail.element = attrs.id;
		//			var chart = new Morris.Bar(chartDetail);
		//			return chart;
		//		}
		//	}
		//}
		//
		///**
		// * morrisLine - Directive for Morris chart - type Line
		// */
		//function morrisLine() {
		//	return {
		//		restrict: 'A',
		//		scope: {
		//			chartOptions: '='
		//		},
		//		link: function(scope, element, attrs) {
		//			var chartDetail = scope.chartOptions;
		//			chartDetail.element = attrs.id;
		//			var chart = new Morris.Line(chartDetail);
		//			return chart;
		//		}
		//	}
		//}
		//
		///**
		// * morrisDonut - Directive for Morris chart - type Donut
		// */
		//function morrisDonut() {
		//	return {
		//		restrict: 'A',
		//		scope: {
		//			chartOptions: '='
		//		},
		//		link: function(scope, element, attrs) {
		//			var chartDetail = scope.chartOptions;
		//			chartDetail.element = attrs.id;
		//			var chart = new Morris.Donut(chartDetail);
		//			return chart;
		//		}
		//	}
		//}
		//
		///**
		// * sparkline - Directive for Sparkline chart
		// */
		//function sparkline() {
		//	return {
		//		restrict: 'A',
		//		scope: {
		//			sparkData: '=',
		//			sparkOptions: '=',
		//		},
		//		link: function (scope, element, attrs) {
		//			scope.$watch(scope.sparkData, function () {
		//				render();
		//			});
		//			scope.$watch(scope.sparkOptions, function(){
		//				render();
		//			});
		//			var render = function () {
		//				$(element).sparkline(scope.sparkData, scope.sparkOptions);
		//			};
		//		}
		//	}
		//};

		/**
		 * icheck - Directive for custom checkbox icheck
		 */
		function icheck($timeout) {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function($scope, element, $attrs, ngModel) {
					return $timeout(function() {
						var value;
						value = $attrs['value'];

						$scope.$watch($attrs['ngModel'], function(newValue){
							$(element).iCheck('update');
						})

						return $(element).iCheck({
							checkboxClass: 'icheckbox_square-green',
							radioClass: 'iradio_square-green'

						}).on('ifChanged', function(event) {
							if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
								$scope.$apply(function() {
									return ngModel.$setViewValue(event.target.checked);
								});
							}
							if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
								return $scope.$apply(function() {
									return ngModel.$setViewValue(value);
								});
							}
						});
					});
				}
			};
		}

		///**
		// * ionRangeSlider - Directive for Ion Range Slider
		// */
		//function ionRangeSlider() {
		//	return {
		//		restrict: 'A',
		//		scope: {
		//			rangeOptions: '='
		//		},
		//		link: function (scope, elem, attrs) {
		//			elem.ionRangeSlider(scope.rangeOptions);
		//		}
		//	}
		//}
		//
		///**
		// * dropZone - Directive for Drag and drop zone file upload plugin
		// */
		//function dropZone() {
		//	return function(scope, element, attrs) {
		//		element.dropzone({
		//			url: "/upload",
		//			maxFilesize: 100,
		//			paramName: "uploadfile",
		//			maxThumbnailFilesize: 5,
		//			init: function() {
		//				scope.files.push({file: 'added'});
		//				this.on('success', function(file, json) {
		//				});
		//				this.on('addedfile', function(file) {
		//					scope.$apply(function(){
		//						alert(file);
		//						scope.files.push({file: 'added'});
		//					});
		//				});
		//				this.on('drop', function(file) {
		//					alert('file');
		//				});
		//			}
		//		});
		//	}
		//}

		/**
		 * fancyBox - Directive for Fancy Box plugin used in simple gallery view
		 */
		function fancyBox() {
			return {
				restrict: 'A',
				link: function(scope, element) {
					element.fancybox({
						openEffect	: 'none',
						closeEffect	: 'none'
					});
				}
			}
		}


		console.log("Adding custom directives");

		/**
		 *
		 * Pass all functions into module
		 */
		app
				.directive('pageTitle', pageTitle)
				.directive('sideNavigation', sideNavigation)
				.directive('iboxTools', iboxTools)
				.directive('minimalizaSidebar', minimalizaSidebar)
				.directive('icheck', icheck)
				.directive('vectorMap', vectorMap)
				.directive('fancyBox', fancyBox);



		return app;
	}
);

// inspinia stuff todo move me somewhere else
/*$(document).ready(function () {

	// Append config box / Only for demo purpose
	$.get(appConfig['appRootPath'] + '/views/skin-config.html', function (data) {
		$('body').append(data);
	});

	// Full height of sidebar
	function fix_height() {
		var heightWithoutNavbar = $("body > #wrapper").height() - 61;
		$(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");
	}
	$(window).bind("load resize click scroll", function() {
		if(!$("body").hasClass('body-small')) {
			fix_height();
		}
	})
	fix_height();

});*/

// Minimalize menu when screen is less than 768px
$(function() {
	$(window).bind("load resize", function() {
		if ($(this).width() < 769) {
			$('body').addClass('body-small')
		} else {
			$('body').removeClass('body-small')
		}
	})
})
