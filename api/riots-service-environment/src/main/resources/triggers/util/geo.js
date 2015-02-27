/**
 * compute distance between two points
 */
function distanceInMeters(p1, p2) {
	var lat1 = p1.latitude;
	var lat2 = p2.latitude;
	var lon1 = p1.longitude;
	var lon2 = p2.longitude;
	if(typeof lat1 == "undefined" || 
			typeof lat2 == "undefined" ||
			typeof lon1 == "undefined" ||
			typeof lon2 == "undefined") {
		return -1;
	}
	var R = 6371 * 1000;
	var dLat = (lat2-lat1).toRad();
	var dLon = (lon2-lon1).toRad();
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.cos((lat1).toRad()) * 
	        Math.cos((lat2).toRad()) * 
	        Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}
Number.prototype.toRad = function() {
	return this * Math.PI / 180;
}

function clone(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/**
 * Construct the path from a sequence of property value 
 * changes containing latitude and longitude changes.
 */
function constructPath(values) {
	var curLoc = {};
	var path = [];
	var i;
	for(i = 0; i < values.length; i ++) {
		v = values[i];
		var propertyValue = JSON.parse(v);
		/*print("VVV: " + v);
		print("VVV propertyValue: " + propertyValue);
		print("VVV PropertyName: " + propertyValue.property);
		print("VVV Value: " + propertyValue.value);*/
		curLoc[propertyValue.property] = propertyValue.value;
		curLoc["time"] = propertyValue.timestamp;


		curLoc.longitude = propertyValue.value.longitude;
		curLoc.latitude = propertyValue.value.latitude;

		/*if(v.getPropertyName().endsWith("longitude")) {
			curLoc.longitude = v.getValue();
		}
		if(v.getPropertyName().endsWith("latitude")) {
			curLoc.latitude = v.getValue();
		}*/

		//print("Curlocation: " + curLoc);
		path.push(clone(curLoc));
	}
	return path;
}

/**
 * Construct a map of object property values,
 * maps thing_ID -> [thing_state_1, thing_state_2, thing_state_3, ...] 
 */
function constructPathMap(values) {
	var map = {};
	for(var i = 0; i < values.length; i ++) {
		var v = values[i];
		var thingId = v['thing-id'];
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
