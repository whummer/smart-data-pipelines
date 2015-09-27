angular.module('rioxApp').controller('EditDataPipeCtrl', function ($scope, $filter, $stateParams, growl, $log, $location) {

	var PREDEFINED_NODERED_KEYS = ["id", "type", "x","y","z", "wires"];

	var NODERED_TO_XD_CATEGORY = {
			"input": "source",
			"function": "processor",
			"output": "sink"
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
				console.log("Got EditorContent: ", content);
				$scope.pipeline = angular.fromJson(content);
			});
	};

	/* the selected datapipe element (when user clicks element) */
	$scope.selectedItem = null;

	$scope.selectItem = function (item) {
		$scope.selectedItem = item;
	};

	/* save pipeline via service call. if _id property is present its a persistent pipe */
	$scope.submitDatapipe = function () {
		var payload = angular.copy($scope.pipeline);

		/* prepare payload */
		var nodeRedNodes = RED.nodes.createCompleteNodeSet();
		payload[PIPE_ELEMENTS] = [];
		var i,j;
		for(i = 0; i < nodeRedNodes.length; i ++) {
			var n = nodeRedNodes[i];
			if(n["type"] != "tab") {
				var node = {};
				payload[PIPE_ELEMENTS].push(node);
				node[ID] = n["id"];
				node[TYPE] = n["type"];
				node[POSITION] = {x: n["x"], y: n["y"], z: n["z"]};
				node[EDGES_OUT] = [];
				for(j = 0; j < n["wires"].length; j ++) {
					var list = n["wires"][j];
					list.forEach(function(wireEnd) {
						node[EDGES_OUT].push(wireEnd);
					});
				}
				node[PARAMS] = {};
				for(var key in n) {
					if(PREDEFINED_NODERED_KEYS.indexOf(key) < 0) {
						node[PARAMS][key] = n[key];
					}
				}
			}
		}
		//console.log(payload);

		if ($scope.pipeline.id) {
			riox.save.pipe(payload, function (response) {
				setNodesClean();
				$log.info('Updated datapipe. Response: ', response);
				growl.info("Datapipe updated successfully.");
			});
		} else {
			riox.add.pipe(payload, function (response) {
				setNodesClean();
				$log.info('Saved datapipe. Response: ', response);
				growl.info("Datapipe saved successfully.");
			});
		}
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

		}, function (error) {
			$log.error('Cannot load pipe %s for editing: %s', pipeId, error);
			growl.error('Cannot load pipe. See console for details');
		});
	}

	function constructCurrentPipeline() {
		var result = {};
		result[PIPE_ELEMENTS] = [];
		result[ID] = $scope.pipeline[ID];
		result[NAME] = $scope.pipeline[NAME];
		RED.nodes.eachNode(function(node) {
			var n = {};
			n[ID] = node[ID].substring(0, 8);
			n[EDGES_OUT] = [];
			n[PARAMS] = {};
			n[TYPE] = node[TYPE];

			for(var key in node) {
				if(PREDEFINED_NODERED_KEYS.indexOf(key) < 0) {
					n[PARAMS][key] = node[key];
				}
			}
			n[CATEGORY] = NODERED_TO_XD_CATEGORY[node._def.category];

			result[PIPE_ELEMENTS].push(n);
			node.__theNode = n;
			console.log(node);
		});
		RED.nodes.eachLink(function(link) {
			console.log(link);
			var tgt = link.target[ID].substring(0, 8);
			link.source.__theNode[EDGES_OUT].push(tgt);
		});
		console.log(result);
		return result;
	}

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

	/* add event listeners */
	setTimeout(function() {
		RED.events.on("view:selection-changed", $scope.onSelectionChange);
	}, 1000);

});
