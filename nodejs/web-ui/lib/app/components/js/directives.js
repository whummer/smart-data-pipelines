/**
 * pageTitle - Directive for set Page title - mata title
 */
function pageTitle($rootScope, $timeout) {
	return {
		link: function (scope, element) {
			var listener = function (event, toState, toParams, fromState, fromParams) {
				// Default title - load on Dashboard 1
				var title = 'riox.io - turn data into value';
				// Create your own title pattern
				if (toState.data && toState.data.pageTitle) title = 'riox.io | ' + toState.data.pageTitle;
				$timeout(function () {
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
function sideNavigation($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element) {
			// Call the metsiMenu plugin and plug it to sidebar navigation
			$timeout(function () {
				element.metisMenu();
			});
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
		templateUrl: 'app/views/common/ibox_tools.html',
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
				$("body").toggleClass("mini-navbar");
				if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
					// Hide menu in order to smoothly turn on when maximize menu
					$('#side-menu').hide();
					// For smoothly turn on menu
					setTimeout(
							function () {
								$('#side-menu').fadeIn(500);
							}, 100);
				} else if ($('body').hasClass('fixed-sidebar')) {
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


/**
 * ionRangeSlider - Directive for Ion Range Slider
 */
function ionRangeSlider() {
	return {
		restrict: 'A',
		scope: {
			rangeOptions: '='
		},
		link: function (scope, elem, attrs) {
			elem.ionRangeSlider(scope.rangeOptions);
		}
	}
}



/**
 * dropZone - Directive for Drag and drop zone file upload plugin
 */
function dropZone() {
	return function ($scope, element, attrs) {
		element.dropzone({
			url: "/upload",
			maxFilesize: 100,
			paramName: "uploadfile",
			maxThumbnailFilesize: 5,
			autoProcessQueue: false,
			accept: function (file, done) {
				console.log("Uploaded file: ", file);
				console.log("Scope: " ,$scope);
				$scope.$parent.logo = file;
				//scope.formData.logo = file;
			}
			/*init: function () {
				scope.files.push({file: 'added'});
				this.on('success', function (file, json) {
				});
				this.on('addedfile', function (file) {
					scope.$apply(function () {
						alert(file);
						scope.files.push({file: 'added'});
					});
				});
				this.on('drop', function (file) {
					alert('file');
				});
			}*/
		});
	}
}

function vectorMap() {
	return {
		restrict: 'A',
		scope: {
			myMapData: '=',
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
							scale: ["#4F8241", "#e4e4e4"],
							normalizeFunction: 'polynomial'
						}
					]
				}
			});
		}
	}
}


/**
 *
 * Pass all functions into module
 */
angular
		.module('rioxApp')
		.directive('pageTitle', pageTitle)
		.directive('sideNavigation', sideNavigation)
		.directive('iboxTools', iboxTools)
		.directive('dropZone', dropZone)
		.directive('icheck', icheck)
		.directive('ionRangeSlider', ionRangeSlider)
		.directive('vectorMap', vectorMap)
		.directive('minimalizaSidebar', minimalizaSidebar);
	/*.directive('ionSlider',function($timeout){
	return{
		restrict:'E',
		scope:{min:'=',
			max:'=',
			type:'@',
			prefix:'@',
			maxPostfix:'@',
			prettify:'@',
			grid:'@',
			gridMargin:'@',
			postfix:'@',
			step:'@',
			hideMinMax:'@',
			hideFromTo:'@',
			from:'=',
			disable:'=',
			onChange:'=',
			onFinish:'='

		},
		template:'<div></div>',
		replace:true,
		link:function($scope,$element,attrs){
			(function init(){
				$element.ionRangeSlider({
					min: $scope.min,
					max: $scope.max,
					type: $scope.type,
					prefix: $scope.prefix,
					maxPostfix: $scope.maxPostfix,
					prettify: $scope.prettify,
					grid: $scope.grid,
					gridMargin: $scope.gridMargin,
					postfix:$scope.postfix,
					step:$scope.step,
					hideMinMax:$scope.hideMinMax,
					hideFromTo:$scope.hideFromTo,
					from:$scope.from,
					disable:$scope.disable,
					onChange:$scope.onChange,
					onFinish:$scope.onFinish
				});
			})();
			$scope.$watch('min', function(value) {
				$timeout(function(){ $element.data("ionRangeSlider").update({min: value}); });
			},true);
			$scope.$watch('max', function(value) {
				$timeout(function(){ $element.data("ionRangeSlider").update({max: value}); });
			});
			$scope.$watch('from', function(value) {
				$timeout(function(){ $element.data("ionRangeSlider").update({from: value}); });
			});
			$scope.$watch('disable', function(value) {
				$timeout(function(){ $element.data("ionRangeSlider").update({disable: value}); });
			});
		}
	}
});
*/