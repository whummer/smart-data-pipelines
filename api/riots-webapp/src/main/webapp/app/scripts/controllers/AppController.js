
function setLoadingStatus(status, text) {
	if(!status) {
		$("#loadingDiv").hide();
	} else {
		$("#loadingDiv").show();
		$("#loadingImg").prop("title", text);
	}
}

var globalRenderStack = [];
function reduceRenderStack() {
	globalRenderStack.splice(0,1);
	if(globalRenderStack.length <= 0) {
		hideSplashScreen();
	}
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
subscriptionIDs = [];
subscriptionHandles = [];
function AppController($scope, $http, $compile, growl) {
	$scope.setLoadingStatus = setLoadingStatus;
	$scope.http = $http;
	$scope.compile = $compile;
	$scope.appConfig = appConfig;
	$scope.growl = growl;

	$scope.highlightMenuItem = function(itemId) {
		$(".nav").find(".active").removeClass("active");
		$(itemId).addClass("active");
	};

	$scope.preparePropertyValues = function(thingType, parentProperty, propsList) {
		delete thingType["$$hashKey"];
		var i;
		/* device type properties */
		if(propsList) {
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
				if(el.parentProp) {
					if(el.parentProp.id == -1) {
						thingType.properties.push(el);
						propsList.splice(i, 1);
						i = i - 1;
					} else {
						var parentPropObj = byId(thingType.properties, el.parentProp.id, "children")[0];
						//console.log("parentPropObj " + el.parentProp.id, parentPropObj);
						parentPropObj.children.push(el);
						propsList.splice(i, 1);
						i = i - 1;
					}
					delete el.parentProp;
				}
				$scope.preparePropertyValues(thingType, el, el.children);
			}
		}

		/* key/value asset properties */
		if(thingType.featureList) {
			thingType.features = {};
			for(var i in thingType.featureList) {
				entry = thingType.featureList[i];
				thingType.features[entry.key] = entry.value;
			}
			thingType.featureList = null;
			delete thingType.featureList;
		}

		return thingType;
	};

	$scope.prepareModelValues = function(thingType, doClone) {
		if(!thingType)
			return thingType;
		if(doClone) {
			thingType = clone(thingType);
		}
		return $scope.preparePropertyValues(thingType, null, thingType.properties);
	};


	$scope.subscribeOnce = function(evtType, callback, id) {
		unsubscribeOnce(id);
		if(!id || $.inArray(id, subscriptionIDs) < 0) {
			var handle = eventBus.subscribe(evtType, callback);
			if(id) {
				subscriptionIDs.push(id);
				subscriptionHandles.push(handle);
			}
		}
	};

	$scope.addClickHandler = function(elementID, callback) {
		$("#" + elementID).on("click", callback);
	};

	/* helper/util methods */

	$scope.growlInfo = function(message) {
		$scope.growlMsg(message, "info");
	}
	$scope.growlWarn = function(message) {
		$scope.growlMsg(message, "warn");
	}
	$scope.growlMsg = function(message, type) {
		var options = { ttl: 2000 };
		var func = null
		var g = rootScope.growl;
		if(type == "info") {
			func = g.info ? g.info : g.addInfoMessage;
		} else if(type == "warn") {
			func = g.warn ? g.warn : g.addWarnMessage;
		}
		func(message, options);
	}

	$scope.range = function(from, to, step) {
		if(!step) step = 1;
		var result = [];
		for(var i = from; i <= to; i += step) {
			result.push(i);
		}
		return result;
	};

	$scope.dateFormat = "yyyy-MM-dd hh:mm:ss";
	rootScope.formatTime = $scope.formatTime = function(timestamp) {
		if(!timestamp) {
			return null;
		}
		return formatDate(timestamp);
	};

	rootScope.formatCoords = function(loc) {
		if(!loc)
			return "";
		var result = loc.latitude.toFixed(4) +
			"," + loc.longitude.toFixed(4);
		return result;
	}
}
