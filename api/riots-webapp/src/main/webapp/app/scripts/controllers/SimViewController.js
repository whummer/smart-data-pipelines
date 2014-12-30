define(['app'], function(app) {
    app.controller('SimViewController', [
        '$scope', '$http', '$compile',
		function($scope, $http, $compile) {

			AppController($scope, $http, $compile);
			//World3DController($scope, $http, $compile);

			rootScope.menuItemActiveClass = { sim: "menuItemActive" }
			rootScope.worldViewEditMode = false;
			$scope.scenariosList = [];

			$scope.simAPI = appConfig.services.simulations.url;
			$scope.propSimAPI = appConfig.services.simulationProps.url;
			$scope.thingTypesAPI = appConfig.services.thingTypes.url;
			$scope.thingsAPI = appConfig.services.things.url;
			$scope.thingTypePropsAPI = appConfig.services.thingTypeProps.url;

			$scope.curScenario = {id: -1};
			$scope.scenariosMap = {};
			$scope.defaultLocation = {lat: 0.1, lng: 0.1};
			$scope.defaultLocation = {lat: 48.19742, lng: 16.37127};
			$scope.simulationTicks = [];
			$scope.simExecutions = [];

			$scope.loadScenarios = function(callback) {
				invokeGET($scope.http, $scope.simAPI + "?page=0&size=100",
					function(data, status, headers, config) {
						$scope.scenariosMap = {};
						scenarios = data.result;
						$.each(scenarios, function(idx,el) {
							$scope.scenariosMap[el.id] = el;
						});
						callback(scenarios);
					}
				);
			}
			$scope.renderSelectScenarios = function() {
				$scope.loadScenarios(function(scenarios) {
					var singleScenario = scenarios.length == 1;
					if(!singleScenario) {
						scenarios.unshift({id: -1, name: "Select Scenario ..."});
					}
					$scope.scenariosList = scenarios;
					if(singleScenario) {
						$scope.curScenario = scenarios[0];
						eventBus.publish("refresh.simulation.scenario", $scope.curScenario);
					}
				});
			}

			$scope.rectifyScenarioModel = function(scenario) {
				if(!scenario) {
					scenario = $scope.curScenario;
				}
				delete scenario["$$hashKey"];
				if(scenario.things) {
					$.each(scenario.things, function(idx,el) {
						delete el["$$hashKey"];
						if(el.type == "GROUP") {
							delete el.instance;
						} else if(el.type == "INSTANCE") {
							delete el.thingType;
							delete el.numInstances;
						}
					});
				}
				if(scenario.constraints) {
					$.each(scenario.constraints, function(idx,el) {
						delete el["$$hashKey"];
						if(el.type == "EXPRESSION") {
							delete el.lhs;
							delete el.rhs;
							delete el.operator;
							delete el.lhsConstant;
							delete el.rhsConstant
						} else if(el.type == "BUILDER") {
							delete el.expression;
						}
					});
				}
			}

			$scope.saveScenarioChanges = function(scenario, callback) {
				invokePUT($scope.http, $scope.simAPI,
					JSON.stringify(scenario),
					function(data, status, headers, config) {
						if(callback) {
							callback();
						}
					}
				);
			}

			$scope.editScenario = function() {
				var item = $scope.curScenario;
				if(!item) return;
				showInputDialog("Please enter a new scenario name.", function(value) {
					item.name = value;
					$scope.saveScenarioChanges(item, function() {
						$scope.curScenario = {id: -1};
						$scope.renderSelectScenarios();
					});
				});
			}
			$scope.addScenario = function() {
				var item = {name: "Unnamed Scenario"};
				invokePOST($scope.http, $scope.simAPI,
					JSON.stringify(item),
					function(data, status, headers, config) {
						$scope.renderSelectScenarios();
					}
				);
			}
			$scope.deleteScenario = function() {
				if(!$scope.curScenario || !$scope.curScenario.id) {
					return;
				}
				console.log("delete scenario " + $scope.curScenario.id);
				var url = $scope.simAPI + "/" + $scope.curScenario.id;
				invokeDELETE($scope.http, url,
					function(data, status, headers, config) {
						$scope.curScenario = {id: -1};
						$scope.renderSelectScenarios();
					}
				);
			}

			$scope.reloadScenario = function() {
				if(!$scope.curScenario || !$scope.curScenario.id) {
					return;
				}
				invokeGET($scope.http, $scope.simAPI + "/" + $scope.curScenario.id,
					function(data, status, headers, config) {
						//console.log("result", data);
						$scope.curScenario = data.result;
						eventBus.publish("refresh.simulation.scenario", $scope.curScenario);
					}
				);
			}

			$scope.sendToWebsocket = function(request) {
				//console.log("sending websocket request:", request);
				$scope.websocket.send(request);
			}

			$scope.receiveMessageFromWebsocket = function(filter, callback) {
				var subscription = eventBus.subscribe("receive.websocket",
				function(event) {
					if(filter) {
						// TODO apply filter
					}
					// unsubscribe and callback with result
					eventBus.unsubscribe(subscription);
					if(callback) {
						callback(JSON.parse(event.data));
					}
				});
			}

			$scope.sendAndReceiveFromWebsocket = function(request, callback) {
				/* first: register listener */
				$scope.receiveMessageFromWebsocket(null, callback);
				/* second: send message */
				$scope.sendToWebsocket(request);
			}

			$scope.onWebsocketUpdate = function(event) {
				eventBus.publish("receive.websocket", event);
			}

			$scope.connectToWebsocket = function() {
				if($scope.websocket) {
					return;
				}
				initWebsocket(appConfig.services.websocket.url, function(ws) {
					$scope.websocket = ws;
					eventBus.publish("init.websocket.done", ws);
				}, $scope.onWebsocketUpdate);
			}

			/* add event handlers */
			$scope.addClickHandler('btnAddScenario', $scope.addScenario);
			$scope.addClickHandler('btnDelScenario', $scope.deleteScenario);
			$scope.addClickHandler('btnEditScenario', $scope.editScenario);
			$("#simViewSimSelect").on("change", function(newValue) {
				console.log("select scenario: ", newValue);
				/*
				$scope.$apply(function() {
					if(newValue == -1) {
						$scope.curScenario = {id: -1};
					} else {
						//$scope.curScenario = $scope.scenariosMap[newValue];
						$scope.curScenario = newValue;
					}
				});
				*/
				eventBus.publish("refresh.simulation.scenario", $scope.curScenario);
			});
			$scope.renderSelectScenarios();

			/* render elements */
			$scope.connectToWebsocket();
        }
    ]);
});
