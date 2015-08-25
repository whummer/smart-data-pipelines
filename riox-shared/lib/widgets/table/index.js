(function() {
	var module = angular.module("riox-table", ["ngTable"]);

	var tableController = function($scope, $filter, ngTableParams) {
	
		$scope.objects = [];
		$scope.cols = [];
		$scope.timeField = $scope.timeField || "timestamp";

		var setParams = function() {
			$scope.tableParams = new ngTableParams({
		        page: 1,
		        count: 25
		    }, {
	            counts: [20,50,100],
		        total: $scope.objects.length,
		        getData: function ($defer, params) {
		        	var orderedData = params.sorting() ?
		                    $filter('orderBy')($scope.objects, params.orderBy()) :
		                    $scope.objects;
		        	var slice = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
		        	$defer.resolve(slice);
		        }
		    });
		};

		var isArray = function(someVar) {
			return Object.prototype.toString.call( someVar ) === '[object Array]';
		};

		var getObjectIDs = function() {
			return elasticsearch.getObjectIDs($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.idField);
		};
		var getAllObjectDetails = function(ids) {
			return elasticsearch.getAllObjectDetails($scope.esUrl, $scope.esIndexName, $scope.esTypeName, $scope.idField, ids, $scope.timeField);
		};
		
		var displayObjects = function(objects) {
			$scope.objects = objects;
			$scope.cols = getTitles();
			setParams();
			$scope.$apply();
		};
	
		var getTitle = function(key) {
			if($scope.columns && $scope.columns[key]) {
				return $scope.columns[key];
			}
			return key;
		};
	
		var getTitles = function() {
			var result = [];
			var keys = [];
			if($scope.columns) {
				for(var key in $scope.columns) {
					keys.push(key);
				}
			} else {
				$scope.objects.forEach(function(obj) {
					for(var key in obj) {
						if(keys.indexOf(key) < 0) {
							keys.push(key);
						}
					}
				});
			}
			keys.forEach(function(key) {
				result.push({
				    title: getTitle(key),
				    sortable: key,
				    show: true,
				    field: key
				});
			});
			return result;
		};
	
		$scope.loadTable = function() {
			getObjectIDs().
				then(getAllObjectDetails).
				then(displayObjects);
		};

		$scope.$watchGroup(['esIndexName', 'esTypeName', 'idField', 'columns', 'timeField'], function() {
			$scope.loadTable();
		});
	}
	
	module.directive('rioxTable', function () {

		return {
	    	restrict: "E",
	    	replace: false,
	    	template: function(elem, attrs) {
	    		return '<table class="table table-bordered table-striped" ng-table-dynamic="tableParams with cols" ' +
	    				(!attrs.width ? "" : (' width="' + attrs.width + '"')) +
	    				(!attrs.height ? "" : (' height="' + attrs.height + '"')) +
	    				(!attrs.style ? "" : (' style="' + attrs.style + '"')) +
	    				'>' +
	    				'<tr ng-repeat="r in $data">' +
	    				'<td ng-repeat="t in $columns" sortable="t.field">{{::r[t.field]}}</td>' +
	    				'</tr>' +
	    				'</table>';
	    	},
	    	scope: {
	    		esUrl: '=',
	    		esIndexName: '=',
	    		esTypeName: '=',
	    		idField: '=',
	    		columns: '=',
	    		timeField: '='
			},
			controller: tableController
		};
	});

})();
