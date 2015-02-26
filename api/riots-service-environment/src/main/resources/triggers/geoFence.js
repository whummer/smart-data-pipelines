/* config */
var center = CONFIG.center;
var range = CONFIG.diameter;

function isWithinRange(location, center, rangeInMeters) {
	var dist = distanceInMeters(location, center);
	return dist <= rangeInMeters;
}

/* construct path map */
var PATH_MAP = constructPathMap(VALUES);

/* create result map */
var inFence = {};
for(var thingId in PATH_MAP) {
	var thingPropList = PATH_MAP[thingId];
	/* get last location */
	var lastLoc = thingPropList[thingPropList.length - 1];
	inFence[thingId] = isWithinRange(lastLoc, center, range);
}

/* return result*/
inFence;
