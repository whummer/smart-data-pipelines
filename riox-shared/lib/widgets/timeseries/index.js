(function() {
	var module = angular.module("riox-timeseries", ["chart.js"]);

	var timeseriesController = function($scope, $rootScope) {

		$scope.chart = {};
		$scope.chart.series = [''];
		$scope.chart.data = [[]];
		$scope.chart.labels = [];
		$scope.chart.colours = [];
		$scope.chart.options = {
				animation : false,
				legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\">" +
						"<% for (var i=0; i<datasets.length; i++){%>" +
							"<%if(datasets[i].label){%>" +
								"<li>" +
								"<span style=\"background-color:<%=datasets[i].strokeColor%>\"></span>" +
								"<%=datasets[i].label%>" +
								"</li>" +
							"<%}%>" +
						"<%}%>" +
						"</ul>"
		};
		$scope.esIndexName = $scope.esIndexName || 'ORG_ID'; // TODO don't hardcode here (?)
		$scope.esUrl = $scope.esUrl || '/api/v1/gateway/elasticsearch/'; // TODO don't hardcode here (?)
		$scope.titles = $scope.titles || [];
		$scope.esSearch = $scope.esSearch || [];
		if(typeof $scope.titles === "string") {
			$scope.titles = [$scope.titles];
		}

		$scope.objects = [];

		var addColours = function(count, color) {
			var colorObj = color ? {
				fillColor: color,
				strokeColor: "rgba(200,200,200,1)"
			} : null;
			for(var i = 0; i < count; i ++) {
				$scope.chart.colours.push(colorObj);
			}
		}

		var getItemSeries = function() {
			if(typeof $scope.esSearch === "string") {
				$scope.esSearch = [$scope.esSearch];
			}
			var series = $scope.chart.series = [];
			$scope.chart.colours = [];
			for(var i = 0; i < $scope.titles.length; i ++) {
				var title = $scope.titles[i];
				series.push(title);
			}

			/* add colors for line charts */
			addColours($scope.titles.length, null);
			/* add colors for additional prediction charts. Note: we need to
			 * add the colors here because for some reason the colors are
			 * ignored if we add them later in function addPrediction(..) */
			addColours($scope.titles.length, "rgba(0,0,0,0)");

			var result = [];
			
			var createHandler = function(i, search) {
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
				promise = promise.then(createHandler(i, search));
			};
			promise = promise.then(function() {
				var numResults = result.length;
				for(var i = 0; i < numResults; i ++) {
					addPrediction(result, i);
				}
				return result;
			});
			return promise;
		};

		var addPrediction = function(result, index) {
			if(!$scope.predictionValues) return;
			var points = result[index];
			var numPoints = points.length;
			var lastItem = points[numPoints - 1];
			var predValues = lastItem[$scope.predictionValues];
			var newIndex = result.length;
			var newLine = result[newIndex] = [];
			for(var i = 0; i < numPoints; i ++) {
				newLine.push(null); /* push empty points to fill up array */
			}
			newLine[numPoints - 1] = points[numPoints - 1];
			if(predValues) {
				for(var i = 0; i < predValues.length; i ++) {
					newLine[numPoints + i] = predValues[i];
				}
			}
		};

		var addPredictionTitles = function(objects) {
			if(!$scope.predictionValues) return;
			var points = objects[0];
			var lastItem = points[points.length - 1];
			var values = lastItem[$scope.predictionValues];
			if(!values) return;
			for(var i = 0; i < values.length; i ++) {
				$scope.chart.labels.push("t+" + (i + 1));
			}
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

					if(obj != null) {
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
						$scope.chart.data[i][j] = obj[$scope.valueField];
					} else {
						$scope.chart.data[i][j] = null;
					}
				}
			}
			addPredictionTitles(objects);
			$scope.$apply();

			/* NOTE: whu: in some situations it happens that the 
			 * scope.apply call is not propagated to the scope of the underlying 
			 * chart. We don't know why this happens at this point, but as a quick 
			 * fix we make this check here and apply the changes within the 
			 * chart scope manually.
			 */
			if($scope.chart.data && !$scope.$$childHead.data) {
				$scope.$$childHead.$apply(function() {
					$scope.$$childHead.data = $scope.chart.data;
					$scope.$$childHead.labels = $scope.chart.labels;
					$scope.$$childHead.options = $scope.chart.options;
					$scope.$$childHead.series = $scope.chart.series;
					$scope.$$childHead.colours = $scope.chart.colours;
					$scope.$$childHead.legend = $scope.showLegend;
					$scope.$$childHead.chartType = "Line";
				});
			}
		};

		$scope.loadChart = function() {
			var prom = Promise.resolve();
			if($scope.pipeId) {
				/* load pipe details from service */
				prom = prom.then(function() {
					return new Promise(function(resolve, reject) {
						riox.pipes($scope.pipeId, function(pipe) {
							//console.log(pipe);
							var els = pipe[PIPE_ELEMENTS];
							for(var i = 0; i < els.length; i ++) {
								var pipeEl = els[i];
								if(pipeEl[ID] == $scope.pipeNodeId) {
									$scope.esIndexName = pipeEl[PARAMS].index || 'ORG_ID';
									$scope.esTypeName = pipeEl[PARAMS].typeName;
									$scope.esSearch = pipeEl[PARAMS].search;
									$scope.timeField = pipeEl[PARAMS].timeField;
									$scope.valueField = pipeEl[PARAMS].valueField;
									$scope.labelTemplate = pipeEl[PARAMS].labelTemplate;
									$scope.titles = pipeEl[PARAMS].titles;
									$scope.predictionValues = pipeEl[PARAMS].predictionValues;
									resolve(pipeEl);
								}
							}
							reject({error: "Unable to find pipe element id '" + $scope.pipeNodeId + "' within pipe '" + $scope.pipeId + "'"});
						}, reject);
					});
				});
			}
			prom.
				then(getItemSeries).
				then(displayObjects);
		};

		$scope.$watchGroup(['timeField', 'valueField', 'labelTemplate', 'esSearch'], function() {
			if($scope.esSearch == ":") return;
			$scope.loadChart();
		});
	}

	module.directive('rioxTimeseries', function () {

		return {
	    	restrict: "E",
	    	replace: false,
	    	template: function(elem, attrs) {
	    		var str = '<canvas class="chart chart-line" chart-data="chart.data" ' +
	    			'chart-labels="chart.labels" chart-series="chart.series" ' +
					'chart-options="chart.options" chart-legend="showLegend" ' +
	    			'chart-colours="chart.colours" style="'+ attrs.style + '" ' +
	    			(!attrs.height ? "" : ('height="'+ attrs.height + '" ')) +
	    			'>' +
					'</canvas>';
	    		return str;
	    	},
	    	scope: {
	    		pipeId: '=',
	    		pipeNodeId: '=',
	    		esUrl: '=',
	    		esIndexName: '=',
	    		esTypeName: '=',
	    		esSearch: '=',
	    		timeField: '=',
	    		valueField: '=',
	    		labelTemplate: '=',
	    		titles: '=',
	    		showLegend: '=',
	    		predictionValues: '='
			},
			controller: timeseriesController
		};
	});

})();
