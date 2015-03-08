/* config */
var levelPropName = CONFIG.levelPropName;
var consumptionPerKm = CONFIG.consumptionPercentPerKm ? CONFIG.consumptionPercentPerKm : 1;

/* main function */
function main() {

	/* construct path */
	var PATH = constructPath(VALUES);

	/* extract last gas level state */
	var lastGasLevelChangeIndex = -1;
	for(var i = 0; i < VALUES.length; i ++) {
		var state = VALUES[i];
		if(state.property == levelPropName) {
			lastGasLevelChangeIndex = i;
		}
	}
	if(lastGasLevelChangeIndex < 0) {
		/* initialize with 100% */
		return 100;
	}
	var lastGasLevelState = PATH[lastGasLevelChangeIndex];

	/* compute result */
	var lastGasLevel = lastGasLevelState[levelPropName];
	var lastLoc = PATH[PATH.length - 1];
	var loc1 = getPropRecursive(lastGasLevelState, "location");
	var loc2 = getPropRecursive(lastLoc, "location");
	print("loc1/loc2 " + " - " + loc1 + " - " + loc2);
	var distInKm = distanceInMeters(loc1, loc2) / 1000;
	print("lastGasLevel " + " - " + lastGasLevel + " - " + consumptionPerKm + " - " + distInKm);
	print(VALUES[VALUES.length - 1]);
	print(PATH[PATH.length - 1]);
	var result = lastGasLevel - (consumptionPerKm * distInKm);

	/* return result */
	if(result < 0)
		result = 0;
	return result;
}
