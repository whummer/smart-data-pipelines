/**
 * Created by omoser on 16/04/15.
 */

var gulp = require('gulp');

//
// build path configuration
//
var BASE_DIR = 'services/users-service';

//
// run service using nodemon
//
gulp.task('services:users:serve', 'serve the users-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});

gulp.task('services:users:run', 'runs the users-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
