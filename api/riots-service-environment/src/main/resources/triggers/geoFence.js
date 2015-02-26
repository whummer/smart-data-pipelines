/* config */
var center = CONFIG.center;
var range = CONFIG.diameter;
var fenceId = FUNCTION.id;

function isWithinRange(location, center, rangeInMeters) {
	var dist = distanceInMeters(location, center);
	return dist <= rangeInMeters;
}

/* create result map */
//var inFence = {};
//for(var thingId in PATH_MAP) {
//	var thingPropList = PATH_MAP[thingId];
//	/* get last location */
//	var lastLoc = thingPropList[thingPropList.length - 1];
//	inFence[thingId] = isWithinRange(lastLoc, center, range);
//}

/* main function */
function main() {
	var thingId = VALUES[VALUES.length - 1].thingId;

	/* construct path map */
	var PATH_MAP = constructPathMap(VALUES);

	/* compute result */
	var thingPropList = PATH_MAP[thingId];
	var lastLoc = thingPropList[thingPropList.length - 1];
	var inFence = isWithinRange(lastLoc, center, range);

	/* return result */
	result = {};
	result[fenceId] = inFence;
	return result;
}
