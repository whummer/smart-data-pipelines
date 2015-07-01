'use strict';

angular.module('rioxApp')
.controller('SchemasSingleCtrl', function ($scope, Auth, $stateParams, growl) {

	$scope.selectedDataItem = {};
	$scope.payload = "{}";

	$scope.$watch("shared.selectedAPI", function() {
		$scope.loadSelectedSchema($stateParams.schemaId);
	});

	$scope.addDataItem = function() {
		if(!$scope.selectedSchema) return;
		var newItem = {};
		newItem[NAME] = "New Item";
		newItem[SELECTOR] = "item";
		$scope.selectedSchema[DATA_ITEMS].push(newItem);
	};
	$scope.removeDataItem = function(item) {
		var schema = $scope.selectedSchema;
		if(!schema) return;
		var items = schema[DATA_ITEMS];
		for(var i = 0; i < items.length; i ++) {
			console.log(items[i], item, items[i] == item);
			if(items[i] == item) {
				return items.splice(i, 1);
			}
		}
	};

	$scope.saveDetails = function() {
		var copy = $scope.prepareApiObj($scope.shared.selectedAPI);
		$scope.selectedDataItem = {};
		riox.save.streams.source(copy, function(saved) {
			$scope.shared.selectedAPI = saved;
			growl.info("Details have been saved.");
		});
	};

	$scope.syncEditor = function() {
		var flattened = null;
		var parsedPayload = null;
		try {
			parsedPayload = JSON.parse($scope.payload);
			flattened = flattenJson(parsedPayload);
		} catch (e) {
			growl.info("Cannot parse JSON text, please check the syntax.");
			return;
		}
		var items = $scope.selectedSchema[DATA_ITEMS];

		var existsInList = function(item) {
			for(var i = 0; i < items.length; i ++) {
				if(items[i][SELECTOR] == item) {
					return true;
				}
			}
			return false;
		};
		var existsInEditor = function(item) {
			for(var key in flattened) {
				if(key == item[SELECTOR]) {
					return true;
				}
			}
			return false;
		};
		var addPathToJSON = function(json, path, dataType) {
			if(path.length <= 0) return;
			var p = path.splice(0, 1)[0];
			if(p == "") return;
			if(typeof json[p] == "undefined") {
				if(path.length <= 0)
					json[p] = dataType;
				else
					json[p] = {};
			}
			if(typeof json[p] != "object" && path.length > 0) {
				json[p] = {};
			}
			addPathToJSON(json[p], path, dataType);
		};

		for(var key in flattened) {
			var value = flattened[key];
			if(!existsInList(key)) {
				var newItem = {};
				newItem[NAME] = key;
				newItem[SELECTOR] = key;
				items.push(newItem);
			}
		}
		for(var j = 0; j < items.length; j ++) {
			if(!existsInEditor(items[j])) {
				if(typeof items[j][SELECTOR] == "undefined") items[j][SELECTOR] = "";
				if(!items[j][TYPE]) items[j][TYPE] = "String";
				var path = items[j][SELECTOR].split(/\./g);
				addPathToJSON(parsedPayload, path, items[j][TYPE]);
				$scope.payload = JSON.stringify(parsedPayload, null, 3);
			}
		}

	};

});
