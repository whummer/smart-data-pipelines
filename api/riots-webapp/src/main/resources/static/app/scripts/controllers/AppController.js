
function setLoadingStatus(status, text) {
	if(!status) {
		$("#loadingDiv").hide();
	} else {
		$("#loadingDiv").show();
		$("#loadingImg").prop("title", text);
	}
}

function destroyElement(elementID, registry) {
	// TODO remove
}

function getWidget(elementID, registry) {
	return null; // TODO
}

var globalRenderStack = [];
function reduceRenderStack() {
	globalRenderStack.splice(0,1);
	if(globalRenderStack.length <= 0) {
		hideSplashScreen();
	}
}

function renderElement(elementID, callback) {
	reduceRenderStack();
	return null; // TODO
}

function watchOnce($scope, evtType, callback, id) {
	if(!id || $.inArray(id, subscriptionIDs) < 0) {
		var handle = $scope.$watch(evtType, callback);
		if(id) {
			subscriptionIDs.push(id);
			subscriptionHandles.push(handle);
		}
	}
}
function unsubscribeOnce(id) {
	var idx = $.inArray(id, subscriptionIDs);
	if(idx >= 0) {
		var handle = subscriptionHandles[idx];
		if(handle && typeof handle == "function") {
			subscriptionHandles[idx]();
		}
		delete subscriptionHandles[idx];
		delete subscriptionIDs[idx];
	}
	return idx;
}

/* base controller with commonly used functionality */
subscriptionIDs = []
subscriptionHandles = []
function AppController($scope, $http, $compile) {
	$scope.setLoadingStatus = setLoadingStatus;
	$scope.renderElement = renderElement;
	$scope.destroyElement = destroyElement;
	$scope.http = $http;
	$scope.compile = $compile;
	$scope.appConfig = appConfig;
	//$scope.authInfo = null; // todo ask waldemar why we throw the authInfo away!

	$scope.highlightMenuItem = function(itemId) {
		$(".nav").find(".active").removeClass("active");
		$(itemId).addClass("active");
	}

	$scope.preparePropertyValues = function(deviceType, parent, propsList) {
		if(!propsList) return;
		delete deviceType["$$hashKey"];
		var i;
		/* device type properties */
		for(i = 0; i < propsList.length; i ++) {
			var el = propsList[i];
			delete el["$$hashKey"];
			delete el["displayName"];
			if(el.baseType == "LIST") {
				delete el.valueDomain;
			}
			if(el.semanticType && el.semanticType.id) {
				el.semanticType = el.semanticType.id;
			}
			if(el.valueDomain) {
				if(el.valueDomain.type == "Continuous") {
					delete el.valueDomain.values;
					delete el.valueDomain.step;
				} else if(el.valueDomain.type == "Discrete") {
					delete el.valueDomain.values;
				} else if(el.valueDomain.type == "Enumerated") {
					delete el.valueDomain.min;
					delete el.valueDomain.max;
				}
			}
			if(typeof el.semanticType == "string") {
				if($scope.shared.semanticPropertyTypes) {
					el.semanticType = byId($scope.shared.semanticPropertyTypes, el.semanticType)[0];
				} else {
					el.semanticType = {
						id: el.semanticType,
						category: "Property"
					};
				}
			}
			if(el.parentProp) {
				if(el.parentProp.id == -1) {
					deviceType.deviceProperties.push(el);
					propsList.splice(i, 1);
					i = i - 1;
				} else {
					var parentPropObj = byId(deviceType.deviceProperties, el.parentProp.id, "children")[0];
					//console.log("parentPropObj " + el.parentProp.id, parentPropObj);
					parentPropObj.children.push(el);
					propsList.splice(i, 1);
					i = i - 1;
				}
				delete el.parentProp;
			}
			$scope.preparePropertyValues(deviceType, el, el.children);
		}

		/* key/value asset properties */
		deviceType.properties = {};
		for(var i in deviceType.propertyList) {
			entry = deviceType.propertyList[i];
			deviceType.properties[entry.key] = entry.value;
		}
		deviceType.propertyList = null;
		delete deviceType.propertyList;
		return deviceType;
	}
	$scope.prepareModelValues = function(deviceType, doClone) {
		if(!deviceType)
			return deviceType;
		if(doClone) {
			deviceType = JSON.parse(JSON.stringify(deviceType));
		}
		return $scope.preparePropertyValues(deviceType, deviceType, deviceType.deviceProperties);
	}


	$scope.subscribeOnce = function(evtType, callback, id) {
		unsubscribeOnce(id);
		if(!id || $.inArray(id, subscriptionIDs) < 0) {
			var handle = eventBus.subscribe(evtType, callback);
			if(id) {
				subscriptionIDs.push(id);
				subscriptionHandles.push(handle);
			}
		}
	}

	$scope.onRenderElement = function(elementID, callback, subscrID) {
		return; // TODO
	}

	$scope.addClickHandler = function(elementID, callback) {
		$("#" + elementID).on("click", callback);
	}
	$scope.addChangeHandler = function(elementID, callback) {
		$scope.addWidgetEventHandler(elementID, "change", callback);
	}
	$scope.addWidgetEventHandler = function(elementID, eventType, callback) {
		var subscrID = "addHandler_" + eventType + "_" + elementID;
		$scope.onRenderElement(elementID, function(el, registry) {
			el.on(eventType, function(arg1,arg2,arg3) {
				callback(arg1,arg2,arg3);
			});
		}, subscrID);
	}

	/* helper/util methods */

	$scope.range = function(from, to, step) {
		if(!step) step = 1;
		var result = [];
		for(var i = from; i <= to; i += step) {
			result.push(i);
		}
		return result;
	}

	rootScope.formatTime = function(timestamp) {
		console.log("formatDate(timestamp)", timestamp);
		formatDate(timestamp);
	}

	rootScope.formatCoords = function(loc) {
		if(!loc)
			return "";
		var result = loc.latitude.toFixed(4) +
			"," + loc.longitude.toFixed(4);
		return result;
	}
}
