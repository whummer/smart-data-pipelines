
var gulp = require('gulp');

/* build path configuration */
var BASE_DIR = 'services/access-service';

/* run service using nodemon */
gulp.task('services:access:serve', 'serve the access-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});

/* run service using plain node */
gulp.task('services:access:run', 'runs the access-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
