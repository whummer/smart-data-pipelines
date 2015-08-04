define(['app'], function(app) {
    app.controller('MetadataViewController', function($scope, $http, $compile, $log) {

			var metadataCatagoryUrls = {
				"Manufacturer" : appConfig.services.manufacturers.url
			};

			AppController($scope, $http, $compile);

			$scope.curSelect = {};

			$scope.loadTable = function(gridConfig, category) {
				riots.manufacturers(function(manufacturers) {
					displayTable(gridConfig, manufacturers, category);
				});
			};

            // todo highlight the newly added element so that you can start editing right away
			var displayTable = function(gridConfig, nodes, category) {
				if(!gridConfig) return;
				gridConfig.data = nodes;
				setTimeout(function() {

					var authInfo = $scope.authInfo ? $scope.authInfo : rootScope.authInfo;
					var user = {
						email: authInfo.email
					};

					require(["raty"], function(raty) {
						$("div.rating_input").each(function(idx, el) {
							loadRating(el, user, $scope.http);
						});
					});
				}, 100);

                $log.debug("Grid config in MetaDataViewController: ", gridConfig);
                $log.debug("Current scope object: ", $scope);

                $scope.gridApi.cellNav.scrollToFocus($scope, gridConfig.data[0])

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
						$log.debug("Event: ", event);
						if(event.type == "dgrid-select") {
							$scope.$apply(function(){
								$scope.curSelect[category] = event.rows[0].data;
							});
				    	} else if(event.type == "dgrid-deselect") {
							$scope.$apply(function(){
								$scope.curSelect[category] = null;
							});
				    	} else if(event.type == "dgrid-datachange") {
				    		var data = event.data;
				    		//data[event.cell.column.field] = event.value;
				    		$scope.updateMetaType(gridConfig, category, data);
				    	}
						/* adjust UI elements */
						$("#btnDelType" + category).attr("disabled", false);


					},
                    false, false, $scope
				);
			};

			$scope.addMetaType = function(gridConfig, category) {
				var url = metadataCatagoryUrls[category];
				var req = { name: "unnamed" };
                $log.debug("Using gridconfig: ", gridConfig);
				$log.debug("Adding metadata via url: ", url);
				invokePOST($scope.http, url,
					JSON.stringify(req),
					function(data, status, headers, config) {
						$scope.loadTable(gridConfig, category);
					}
				);
			};

			$scope.updateMetaType = function(gridConfig, category, instance) {
				var url = metadataCatagoryUrls[category];
				invokePUT($scope.http, url, angular.toJson(instance), function(data, status, headers, config) {
						$scope.loadTable(gridConfig, category);
					}
				);
			};

			$scope.deleteMetaType = function(gridConfig, category) {
				var curSelect = $scope.curSelect[category];
				$log.warn("About to delete metadata from category " + category + ": ", curSelect);
				var url = metadataCatagoryUrls[category] + "/" + curSelect.id;
				$log.debug("Using URL for metadata DELETE: ", url);
				//console.log("delete", url);
				invokeDELETE($scope.http, url,
					function(data, status, headers, config) {
						$scope.loadTable(gridConfig, category);
					}
				);
			}
        }
    );
});
