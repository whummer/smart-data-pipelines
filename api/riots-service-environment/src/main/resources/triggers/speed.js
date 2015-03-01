/* config */
var maxPoints = 5;

function main() {

	/* construct path */
	var PATH = constructPath(VALUES);
	/*print("-------- PATH --------");

	print(JSON.stringify(PATH));*/

	/* compute speed */
	var dist = 0;
	var time = 0;
	var i = PATH.length - 1;
	for(; i > 0 && (PATH.length - i) < maxPoints; i --) {
		var v = PATH[i];
		var v1 = PATH[i - 1];
		var tmp = distanceInMeters(v.location, v1.location);
		time += Math.abs(v.time - v1.time) / 1000;
		dist += tmp >= 0 ? tmp : 0;
	}

	/*print("Distance: " + dist);
	print("Time: " + time);*/

	/* return speed */
	var speed = dist / time;
	return speed;

}