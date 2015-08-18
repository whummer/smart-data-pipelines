(function() {
	var module = angular.module("riox-timeseries", ["chart.js"]);

	var timeseriesController = function($scope, $rootScope, $compile) {

		$scope.chart = {};
		$scope.chart.series = ['# Requests'];
		$scope.chart.data = [[]];
		$scope.chart.dataAll = [[]];
		$scope.chart.labels = [];
		$scope.chart.labelsAll = [];
		$scope.chart.options = {
				animation : false
		};

		$scope.objects = [];

		var getItemSeries = function() {
			return elasticsearch.getTimeseries($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.esSearch, $scope.timeField, 50);
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
			$scope.chart.data = [[]];
			$scope.chart.labels = [];
			$scope.objects = objects;
			for(var i = 0; i < objects.length; i ++) {
				var obj = objects[i];
				var label = null;
				if(!$scope.labelTemplate) {
					label = obj[$scope.timeField];
				} else {
					var tmpScope = $rootScope.$new(true);
					angular.extend(tmpScope, obj);
					label = replaceTemplate($scope.labelTemplate, tmpScope);
				}
				$scope.chart.labels.push(label);
				$scope.chart.data[0].push(obj[$scope.valueField]);
			}
			$scope.$apply();
		};

		$scope.loadChart = function() {
			getItemSeries().
				then(displayObjects);
		};

		$scope.$watchGroup(['timeField', 'valueField', 'labelTemplate', 'esSearch'], function() {
//			console.log($scope.esSearch);
			if($scope.esSearch == ":") return;
			$scope.loadChart();
		});
	}
	
	module.directive('rioxTimeseries', function ($compile) {

		return {
	    	restrict: "E",
	    	replace: false,
	    	template: function(elem, attrs) {
	    		var str = '<canvas class="chart chart-line" data="chart.data" ' +
	    			'labels="chart.labels" series="chart.series" ' +
					'click="onClick" options="chart.options" ' +
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
	    		labelTemplate: '='
			},
			controller: timeseriesController
		};
	});

})();
