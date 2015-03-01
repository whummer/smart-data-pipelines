/* config */
var PROP_NAME = CONFIG.percentagePropName ? CONFIG.percentagePropName : "gasLevel";

function main() {

	/* construct path */
	var PATH = constructPath(VALUES);

	var dist = 0;
	var gasLevelStart = -1;
	var gasLevelEnd = -1;
	for(var i = 0; i < PATH.length - 1; i ++) {
		var loc1 = PATH[i].location;
		var loc2 = PATH[i + 1].location;
		var tmp = distanceInMeters(loc1, loc2);
		if(tmp >= 0) {
			dist += tmp
		}
		if(PATH[i][PROP_NAME]) {
			if(gasLevelStart < 0) {
				gasLevelStart = PATH[i][PROP_NAME];
			}
			gasLevelEnd = PATH[i][PROP_NAME];
		}
	}

	var gasUsage = gasLevelStart - gasLevelEnd;
	var gasUsagePerM = gasUsage / dist;
	var remaining = gasLevelEnd / gasUsagePerM;

	/* return result*/
	return remaining;
}
