(function() {
	var module = angular.module("riox-timeseries", ["chart.js"]);

	var timeseriesController = function($scope, $rootScope, $compile) {

		$scope.chart = {};
		$scope.chart.series = [''];
		$scope.chart.data = [[]];
		$scope.chart.dataAll = [[]];
		$scope.chart.labels = [];
		$scope.chart.labelsAll = [];
		$scope.chart.options = {
				animation : false
		};

		$scope.objects = [];

		var getItemSeries = function() {
			if(typeof $scope.esSearch == "string") {
				$scope.esSearch = [$scope.esSearch];
			}
			$scope.chart.series = $scope.titles;
			var result = [];
			
			var createHandler = function(i) {
				return (function() {
					return elasticsearch.getTimeseries($scope.esUrl, $scope.esIndexName, $scope.esTypeName, search, $scope.timeField, 50).
						then(function(res) {
							result[i] = res;
						});
				});
			};
			
			var promise = new Promise(function(r){r()});
			for(var i = 0; i < $scope.esSearch.length; i ++) {
				var search = $scope.esSearch[i];
				promise = promise.then(createHandler(i));
			};
			promise = promise.then(function() {
				return result;
			});
			return promise;
		};

		var replaceTemplate = function(template, scope) {
			var rePattern = /\{\{[^\}]+\}\}/gi;
			return template.replace(rePattern, function(match, text){
				match = match.substring(2, match.length - 2);
				var res = scope.$eval(match);
				return res;
			});
		};

		var displayObjects = function(objects) {
			$scope.chart.data = [];
			$scope.chart.labels = [];
			$scope.objects = objects;
			for(var i = 0; i < objects.length; i ++) {
				var series = objects[i];
				$scope.chart.data[i] = [];

				for(var j = 0; j < series.length; j ++) {
					var obj = series[j];

					var label = null;
					if(!$scope.labelTemplate) {
						label = obj[$scope.timeField];
					} else {
						var tmpScope = $rootScope.$new(true);
						angular.extend(tmpScope, obj);
						label = replaceTemplate($scope.labelTemplate, tmpScope);
					}
					if(i == 0) {
						$scope.chart.labels.push(label);
					}
					$scope.chart.data[i].push(obj[$scope.valueField]);
				}
			}
			$scope.$apply();
		};

		$scope.loadChart = function() {
			getItemSeries().
				then(displayObjects);
		};

		$scope.$watchGroup(['timeField', 'valueField', 'labelTemplate', 'esSearch'], function() {
			if($scope.esSearch == ":") return;
			$scope.loadChart();
		});
	}
	
	module.directive('rioxTimeseries', function ($compile) {

		return {
	    	restrict: "E",
	    	replace: false,
	    	template: function(elem, attrs) {
	    		var str = '<canvas class="chart chart-line" chart-data="chart.data" ' +
	    			'chart-labels="chart.labels" chart-series="chart.series" ' +
					'chart-options="chart.options" chart-legend="showLegend" ' +
	    			'style="'+ attrs.style + '" ' +
	    			(!attrs.height ? "" : ('height="'+ attrs.height + '" ')) +
	    			'>' +
					'</canvas>';
	    		return str;
	    	},
	    	scope: {
	    		esUrl: '=',
	    		esIndexName: '=',
	    		esTypeName: '=',
	    		esSearch: '=',
	    		timeField: '=',
	    		valueField: '=',
	    		labelTemplate: '=',
	    		titles: '=',
	    		showLegend: '='
			},
			controller: timeseriesController
		};
	});

})();
