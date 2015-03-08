/* config */
var center = CONFIG.center;
var range = CONFIG.diameter;
var fenceId = FUNCTION.id;

function isWithinRange(location, center, rangeInMeters) {
	var dist = distanceInMeters(location, center);
	return dist <= rangeInMeters;
}

/* main function */
function main() {
	var thingId = VALUES[VALUES.length - 1]["thing-id"];

	/* construct path map */
	var PATH_MAP = constructPathMap(VALUES);

	/* compute result */
	var thingPropList = PATH_MAP[thingId];
	var lastLoc = getPropRecursive(thingPropList[thingPropList.length - 1], "location");
	var inFence = isWithinRange(lastLoc, center, range);

	/* return result */
	result = {};
	result[fenceId] = inFence;
	return result;
}
