
function setLoadingStatus(status, text) {
	if(!status) {
		$("#loadingDiv").hide();
	} else {
		$("#loadingDiv").show();
		$("#loadingImg").prop("title", text);
	}
}

function destroyElement(elementID, registry) {
	if(!registry) {
		registry = rootDijitRegistry;
	}
	existing = registry.byId(elementID);
	if(existing) {
		var node = document.getElementById(existing.id);
		var placeholder = document.createElement("div");
		placeholder.id = existing.id;
		node.parentNode.replaceChild(placeholder, node);
		try {
			existing.destroyRecursive();
		} catch(e) {
			existing.destroy();
		}
		registry.remove(existing.id);
	}
}

function getWidget(elementID, registry) {
	if(!registry) {
		registry = rootDijitRegistry;
	}
	var widget = registry.byId(elementID);
	if(!widget) {
		el = document.getElementById(elementID);
		widget = registry.byId(el.children[0].id);
	}
	return widget;
}

function renderElement(elementID, callback) {
	console.log("Rendering: " + elementID);
	$(document).ready(function() { 
		require(
			["dojo/parser", "dijit/registry", "dojo/domReady!"],
			function(parser, registry){
				var widget = getWidget(elementID, registry);
				if(widget) {
					widget.destroyRecursive();
				}
				el = parser.parse(elementID);
				if(callback) {
					el.then(callback(el));
				}
	    });
	});
}

/* base controller with commonly used functionality */
subscriptionIDs = []
function AppController($scope, $http, $compile) {
	$scope.setLoadingStatus = setLoadingStatus;
	$scope.renderElement = renderElement;
	$scope.destroyElement = destroyElement;

	$scope.subscribeOnce = function(evtType, callback, id) {
		if(!id || $.inArray(id, subscriptionIDs) < 0) {
			if(id) {
				subscriptionIDs.push(id);
			}
			$scope.dojo.subscribe(evtType, callback);
		}
	}
}

// render menu
renderElement("headerMenu");


// TODO remove
/*define(['app'], function(app) {
	app.controller('AppController',
	[
		'$scope', '$http', '$compile',
		function($scope, $http, $compile) {
			console.log("define AppController");
			$scope.setLoadingStatus = setLoadingStatus;
			$scope.renderElement = renderElement;
			$scope.destroyElement = destroyElement;

			$scope.subscribeOnce = function() {
				$scope.dojo.subscribe("select.DeviceType", function(event) {
					$scope.buildPropsTable(event);
				});
			}
		}
	]);
});*/
