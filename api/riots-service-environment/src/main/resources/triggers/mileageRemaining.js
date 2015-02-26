/* config */


/* construct path */
var PATH = constructPath(VALUES);

var dist = 0;
var gasLevelStart = -1;
var gasLevelEnd = -1;
for(var i = 0; i < PATH.length - 1; i ++) {
	var tmp = distanceInMeters(PATH[i], PATH[i + 1]);
	if(tmp >= 0) {
		dist += tmp
	}
	if(PATH[i].gasLevel) {
		if(gasLevelStart < 0) {
			gasLevelStart = PATH[i].gasLevel;
		}
		gasLevelEnd = PATH[i].gasLevel;
	}
}

var gasUsage = gasLevelStart - gasLevelEnd;
var gasUsagePerM = gasUsage / dist;
var remaining = gasLevelEnd / gasUsagePerM;

/* return result*/
remaining;