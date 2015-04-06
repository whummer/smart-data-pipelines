function toRad(num) {
	return num * Math.PI / 180;
}

/**
 * compute distance between two points
 */
function distanceInMeters(p1, p2) {
	if(!p1 || !p2) {
		return -1;
	}
	var lat1 = getPropRecursive(p1, "latitude");
	var lat2 = getPropRecursive(p2, "latitude");
	var lon1 = getPropRecursive(p1, "longitude");
	var lon2 = getPropRecursive(p2, "longitude");
	//print("lat/lon 1/2 " + lat1 + " - " + lat2 + " - " + lon1 + " - " + lon2);
	if(typeof lat1 == "undefined" ||
			typeof lat2 == "undefined" ||
			typeof lon1 == "undefined" ||
			typeof lon2 == "undefined") {
		return -1;
	}
	var R = 6371 * 1000;
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1);
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.cos(toRad(lat1)) * 
	        Math.cos(toRad(lat2)) * 
	        Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return Math.abs(d);
}

function getPropRecursive(obj, propName) {
	if(typeof obj[propName] != "undefined") {
		return obj[propName];
	}
	if(typeof obj == "object") {
		for(key in obj) {
			var v = getPropRecursive(obj[key], propName);
			if(typeof v != "undefined") {
				return v;
			}
		}
	}
};

Number.prototype.toRad = function() {
	return toRad(this);
};

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Construct the path from a sequence of property value
 * changes containing latitude and longitude changes.
 */
/*function constructPath(values) {
	var curLoc = {};
	var path = [];
	var i;
	for(i = 0; i < values.length; i ++) {
		v = values[i];
		var propertyValue = JSON.parse(v);
		curLoc[propertyValue.property] = propertyValue.value;
		curLoc["time"] = propertyValue.timestamp;
		curLoc.longitude = propertyValue.value.longitude;
		curLoc.latitude = propertyValue.value.latitude;
		path.push(clone(curLoc));
	}
	
	return path;
}*/

function constructPath(values) {
	var curState = {};
	var path = [];
	var i;
	for(i = 0; i < values.length; i ++) {
		v = values[i];
		setProperty(curState, v.property, v.value)
		curState.time = v.timestamp;
		var cloned = clone(curState);
		path.push(cloned);
	}
	return path;
}

function setProperty(obj, key, value) {
	if(key.indexOf(".") >= 0) {
		var parentProp = key.substring(0, key.indexOf("."));
		var childProp = key.substring(key.indexOf(".") + 1);
		if(!obj[parentProp]) {
			obj[parentProp] = {};
		}
		setProperty(obj[parentProp], childProp, value);
	} else {
		obj[key] = value;
	}
}

/**
 * Construct a map of object property values,
 * maps thing_ID -> [thing_state_1, thing_state_2, thing_state_3, ...] 
 */
function constructPathMap(values) {
	var map = {};
	for(var i = 0; i < values.length; i ++) {
		var v = values[i];
		var thingId = v["thing-id"];
		if(!map[thingId]) {
			map[thingId] = [];
		}
		map[thingId].push(v);
	}
	for(var key in map) {
		map[key] = constructPath(map[key]);
	}
	return map;
}
