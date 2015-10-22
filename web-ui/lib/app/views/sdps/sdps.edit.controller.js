angular.module('rioxApp').controller('EditDataPipeCtrl', function ($scope, $stateParams, growl, $log, $location, $state) {

	var PREDEFINED_NODERED_KEYS =
		[
		 "id", "type", "x","y","z", "wires",
		 "deployStatus", "changed", "valid", "dirty",
		 "outputs", "inputs", "ports"
		];

	var NODERED_TO_XD_CATEGORY = {
			"input": "source",
			"function": "processor",
			"output": "sink"
	};
	
	$scope.testData = {
		request: JSON.stringify({
			id: 1,
			time: 1,
			value: 10,
			location: {
				lat: 48.2,
				lon: 16.3667
			}
		}, null, '\t')
	};

	$scope.selection = {
		nodes: []
	};

	/* the container for our pipeline elements */
	$scope.pipeline = {
		elements: []
	};

	/* edit existing pipeline */
	if ($stateParams.pipeId) {
		loadPipeById($stateParams.pipeId);
	}

	/* import existing pipeline definition (JSON) */
	$scope.importPipeline = function () {
		showEditorDialog(
			"Paste the definition of your pipeline below",
			"Import Datapipe", {options: {mode: 'json'}}, function (content) {
				$scope.pipeline = angular.fromJson(content);
			});
	};

	/* the selected datapipe element (when user clicks element) */
	$scope.selectedItem = null;

	$scope.selectItem = function (item) {
		$scope.selectedItem = item;
	};

	/* save pipeline via service call. 
	 * if _id property is present its a persistent pipe */
	$scope.submitDatapipe = function () {

		/* prepare payload */
		var payload = constructCurrentPipeline(true);

		if ($scope.pipeline.id) {
			riox.save.pipe(payload, function (response) {
				setNodesClean();
				growl.info("Datapipe updated successfully.");
			});
		} else {
			riox.add.pipe(payload, function (response) {
				setNodesClean();
				$state.go('index.sdps.create', {pipeId: response[ID]});
				growl.info("Datapipe saved successfully.");
			});
		}
	};

	$scope.pushTestData = function() {
		var node = $scope.selection.nodes[0];
		if(!node || node._def[CATEGORY] != "input") {
			return;
		}
		var testData = $scope.testData.request;
		try {
			testData = JSON.parse(testData);
		} catch(e) {
			// no JSON
		}
		var pipeID = $scope.pipeline[ID];
		var inputID = node[ID];
		var url = servicesConfig.pipes.url + "/deployments/by/pipe/" + pipeID + "/input/" + inputID;
		riox.callPOST(url, testData, function(result) {
			console.log("result", result);
		}, function(error) {
			console.log("error", error);
			growl.error('Cannot push test data. See console for details.');
		});
	};

	$scope.previewDatapipe = function() {
		var pipe = constructCurrentPipeline();
		riox.pipe.preview(pipe, function() {
			console.log("preview deployed");
		});
	};

	var setNodesClean = function() {
		RED.nodes.eachNode(function(node) {
			if (node.changed) {
				node.dirty = true;
				node.changed = false;
			}
		});
		// Once deployed, cannot undo back to a clean state
		RED.history.markAllDirty();
		RED.view.redraw();
		RED.events.emit("deploy");
		window.onbeforeunload = null; // make sure that we are not prompted on reload
	};

	/* remove all elements from pipeline canvas */
	$scope.clearCanvas = function () {
		$scope.pipeline.elements = [];
	};

	/* revert all changes to current pipeline */
	$scope.revertChanges = function(pipeline) {
		$log.debug('Reverting all changes to pipeline ', pipeline.name);
		loadPipeById(pipeline.id, 'Reverted Changes');
	};

	/* delete given pipeline and go to listview */
	$scope.deletePipelineAndShowList = function (pipeline) {
		$scope.deletePipeline(pipeline, function () {
			$location.path('/sdps/sdps/list'); // todo check routes, somethings wrong here
		});
	};

	/* load pipeline by ID */
	function loadPipeById(pipeId, message) {
		riox.pipes(pipeId, function (pipe) {
			$scope.pipeline = pipe;
			$scope.$apply();
			if (message) {
				growl.info(message);
			}
			/* init node-red */
			window.nodeRedCurrentFlowID = pipeId;
			// Note: setting the nodeRedCurrentFlowID at this point is all we need to do,
			// when the editor loads the node-red JS files later, RED.loadFlows() will 
			// be automatically called and loads the flow with the given pipeId.

			/* initialize pipe elements */
			$scope.pipeline[PIPE_ELEMENTS].forEach(function(el) {
				if(el[TYPE] == "script") {
					/* load script code */
					var loc = el[PARAMS].scriptLocation;
					if(loc) {
						$.get(loc, function(data, response) {
							el[PARAMS].code = data;
							var setCode = function(code, el, retries) {
								if(retries < 0) return;
								var node = getNodeRedNodeForPipeElement(el);
								if(node) {
									node.code = data;
								} else {
									setTimeout(function() {
										setCode(code, el, retries - 1);
									}, 1500);
								}
							}
							setCode(data, el, 5);
						});
					}
				}
			});

		}, function (error) {
			$log.error('Cannot load pipe %s for editing: %s', pipeId, error);
			growl.error('Cannot load pipe. See console for details');
		});
	}

	function pollPipeStatus() {
		if($scope.pipeline && $scope.pipeline[ID]) {
			var pipeId = $scope.pipeline[ID];
			var query = {};
			query[PIPE_ID] = pipeId;
			var timeoutShort = 1000*10;
			var timeoutLong = 1000*60;
			riox.pipe.deployments(query, function(deployment) {
				//console.log("deployment", deployment);
				deployment[PIPE_ELEMENTS].forEach(function(el) {
					var node = getNodeRedNodeForPipeElement(el);
					if(el[STATUS] == STATUS_UNKNOWN) el[STATUS] = "deployed";
					node.deployStatus = el[STATUS];
					node.dirty = true;
				});
				RED.view.redraw();
				setTimeout(function() {
					pollPipeStatus();
				}, timeoutLong);
			}, function(error) {
				setTimeout(function() {
					pollPipeStatus(pipeId);
				}, timeoutShort);
			});
		} else {
			setTimeout(function() {
				pollPipeStatus();
			}, timeoutShort);
		}
	}

	function getNodeRedNodeForPipeElement(pipeEl) {
		var result = null;
		RED.nodes.eachNode(function(el) {
			if(el[ID] == pipeEl[ID]) {
				result = el;
			}
		});
		return result;
	}

	function constructCurrentPipeline(excludeMetadata) {
		var result = {};
		result[PIPE_ELEMENTS] = [];
		result[ID] = $scope.pipeline[ID];
		result[NAME] = $scope.pipeline[NAME];
		
		var METADATA_ATTRS = ["_def", "_ports", "__theNode", "_", "$$hashKey"];
		
		RED.nodes.eachNode(function(node) {
			var n = {};
			n[ID] = node[ID].substring(0, 8);
			n[EDGES_OUT] = [];
			n[PARAMS] = {};
			n[TYPE] = node[TYPE];

			for(var key in node) {
				if(PREDEFINED_NODERED_KEYS.indexOf(key) < 0) {
					if(!excludeMetadata || METADATA_ATTRS.indexOf(key) < 0) {
						n[PARAMS][key] = node[key];
					}
				}
			}
			n[CATEGORY] = NODERED_TO_XD_CATEGORY[node._def.category];
			n[POSITION] = {x: node["x"], y: node["y"], z: node["z"]};

			result[PIPE_ELEMENTS].push(n);
			node.__theNode = n;
			//console.log(node);
		});
		RED.nodes.eachLink(function(link) {
			var tgt = link.target[ID].substring(0, 8);
			link.source.__theNode[EDGES_OUT].push(tgt);
		});
		if(excludeMetadata) {
			RED.nodes.eachNode(function(node) {
				delete node.__theNode;
			});
		}
		return result;
	}

	/* callback, when user confirms the node edit dialog with "OK" */
	window.nodeRedOneditsave = function(node) {
		if(node) {
			if(node[TYPE] == "script") {
				var code = $("#node-input-code").val();
				console.log("node.scriptLocation", node.scriptLocation);
				if(!node.scriptLocation) {
					riox.add.file(code, function(result) {
						node.scriptLocation = servicesConfig.files.url + "/" + result.fileID;
					});
				} else {
					var info = {};
					info[URL] = node.scriptLocation;
					info[CONTENT] = code;
					riox.save.file(info, function(result) {
						/* upload ok */
					});
				}
			}
		}
	};

	/* assign UUIDs (iff there is none) to element when they are dropped on the canvas */
	$scope.assignUUID = function(event, index, item) {
		var uuid = window.uuid.v4();
		if (!item.uuid) {
			$log.debug("Assigning UUID '" + uuid + ' to element ' + item.subtype);
			item.uuid = uuid;
		}

		return item;
	};

	/* drag and drop helpers, debugging */
	$scope.$watch('sources', function () {
		$log.debug("Sources changed: ", $scope.sources);
	});

	$scope.logEvent = function (message, event) {
		console.log(message, '(triggered by the following', (event ? event.type : ' UNKNOWN'), 'event)');
		console.log(event);
	};

	$scope.logListEvent = function (action, event, index, external, type) {
		var message = external ? 'External ' : '';
		message += type + ' element is ' + action + ' position ' + index;
		$scope.logEvent(message, event);
	};

	$scope.layoutGraph = function(pipeline) {
		var g = new dagre.graphlib.Graph();
		g.setGraph({rankdir: "LR"});
		g.setDefaultEdgeLabel(function() { return {}; });

		var margin = 20;

		var list = [];
		var nodeMap = {};
		RED.nodes.eachNode(function(el) {
			nodeMap[el.id] = el;
			var node = {id: el.id, width: el.w, height: el.h};
			list.push(node);
			g.setNode(el.id, node);
		});

		RED.nodes.eachLink(function(link) {
			var src = link["source"]["id"];
			var tgt = link["target"]["id"];
			g.setEdge(src, tgt);
		});

		dagre.layout(g);

		list.forEach(function(item) {
			var node = nodeMap[item.id];
			node.x = item.x + margin;
			node.y = item.y + margin;
			node.z = item.z || 0;
			node.dirty = true;
		});

		RED.view.redraw();
	};

	$scope.onSelectionChange = function(sel) {
		//console.log("sel change", sel);
		$scope.$apply(function() {
			$scope.selection.nodes = sel.nodes;
		});
	};

	/* get nav. bar stack */
	$scope.getNavPart = function() {
		return { sref: "index.sdps.create", name: "Edit Pipeline" };
	}
	$scope.setNavPath($scope, $state);

	/* add event listeners */
	setTimeout(function() {
		RED.events.on("view:selection-changed", $scope.onSelectionChange);
	}, 1000);

	/* poll the pipe deployment status */
	pollPipeStatus();

});
