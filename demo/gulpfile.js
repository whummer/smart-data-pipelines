
var gulp = require('gulp');

var installBower = function(demoName) {
	runCmd("bower", ["install"], __dirname + "/" + demoName);
};

/* run service using nodemon */
gulp.task('demo:stadtwerke:serve', function () {
	installBower("stadtwerke");
	runCmd("nodemon", ["server.js"], __dirname + "/stadtwerke");
});
/* run service using plain node */
gulp.task('demo:stadtwerke:run', function () {
	installBower("stadtwerke");
	runCmd("node", ["server.js"], __dirname + "/stadtwerke");
});
