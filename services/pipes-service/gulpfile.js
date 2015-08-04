/**
 * Created by omoser on 16/04/15.
 */

var gulp = require('gulp');

/* build path configuration */
var BASE_DIR = 'services/pipes-service';

/* run service using nodemon */
gulp.task('services:pipes:serve', 'serve the pipes-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});

/* run service using plain node */
gulp.task('services:pipes:run', 'runs the pipes-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
