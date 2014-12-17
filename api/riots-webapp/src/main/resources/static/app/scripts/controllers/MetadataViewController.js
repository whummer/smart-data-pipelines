define(['app'], function(app) {
    app.controller('MetadataViewController', [
        '$scope', '$http', '$compile',
		function($scope, $http, $compile) {

			AppController($scope, $http, $compile);

			$scope.semanticsAPI = appConfig.services.semanticTypes.url;
			$scope.curSelect = {};

			$scope.loadTable = function(gridConfig, category) {
				var categories = ["Property", "Device", "Manufacturer"];
				if(categories.indexOf(category) < 0) {
					console.warn("Semantic type category should be either of: " + categories);
					return;
				}
				invokeGET($scope.http, $scope.semanticsAPI + "/" + category,
					function(data, status, headers, config) {
						displayTable(gridConfig, data.result, category);
					}
				);
			};

			var displayTable = function(gridConfig, nodes, category) {
				gridConfig.data = nodes;
				setTimeout(function() {

					var authInfo = $scope.authInfo ? $scope.authInfo : rootScope.authInfo;
					var user = {
						email: authInfo.email
					}

					require(["raty"], function(raty) {
						$("div.rating_input").each(function(idx, el) {
							loadRating(el, user, $scope.http);
						});
					});
				}, 100);
			};

			$scope.initTable = function(gridConfig, category) {

				var elementID = "metaTypesTable" + category;

				var columnsConfig = [
					{label: "Name", field: "name", sortable: true, editOn: "dblclick"},
					{label: "Rating", field: "rating", sortable: true, 
						cellTemplate: '<div id="{{row.entity.id}}" class="rating_input ui-grid-cell-contents">' + 
						'<img alt="loading" src="img/loading.gif" style="height: 20px"/></div>'
					}
				];

				$("#btnDelType" + category).attr("disabled", true);

				gridConfig.data = [];
				renderUITable(gridConfig, elementID, columnsConfig,
					function(event) {
						if(event.type == "dgrid-select") {
							console.log("Event: dgrid-select");
							$scope.$apply(function(){
								$scope.curSelect[category] = event.rows[0].data;
							});
				    	} else if(event.type == "dgrid-deselect") {
							console.log("Event: dgrid-deselect");
							$scope.$apply(function(){
								$scope.curSelect[category] = null;
							});
				    	} else if(event.type == "dgrid-datachange") {
							console.log("Event: dgrid-datachange");
				    		var data = event.grid.row(event).data;
							console.dir(data);
				    		data[event.cell.column.field] = event.value;
				    		$scope.updateMetaType(gridConfig, category, data);
				    	}
						/* adjust UI elements */
						$("#btnDelType" + category).attr("disabled", false);
					},
					false, false
				);
			};

			$scope.addMetaType = function(gridConfig, category) {
				var req = { category: category, name: "unnamed" };
				invokePOST($scope.http, $scope.semanticsAPI,
					JSON.stringify(req),
					function(data, status, headers, config) {
						$scope.loadTable(gridConfig, category);
					}
				);
			};

			$scope.updateMetaType = function(gridConfig, category, instance) {
				invokePUT($scope.http, $scope.semanticsAPI,
					JSON.stringify(instance),
					function(data, status, headers, config) {
						$scope.loadTable(gridConfig, category);
					}
				);
			};

			$scope.deleteMetaType = function(gridConfig, category) {
				var curSelect = $scope.curSelect[category];
				var url = $scope.semanticsAPI + "/" + curSelect.id;
				//console.log("delete", url);
				invokeDELETE($scope.http, url,
					function(data, status, headers, config) {
						$scope.loadTable(gridConfig, category);
					}
				);
			}
        }
    ]);
});
