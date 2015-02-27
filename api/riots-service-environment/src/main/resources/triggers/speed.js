/* config */
var maxPoints = 5;

function main() {

	/* construct path */
	var PATH = constructPath(VALUES);

	/* compute speed */
	var dist = 0;
	var time = 0;
	var i = PATH.length - 1;
	for(; i > 0 && (PATH.length - i) < maxPoints; i --) {
		var v = PATH[i];
		var v1 = PATH[i - 1];
		var tmp = distanceInMeters(v, v1);
		time += (v.time - v1.time) / 1000;
		dist += tmp >= 0 ? tmp : 0;
	}

	/* return speed */
	var speed = dist / time;
	return speed;

}