
var gulp = require('gulp');

/* build path configuration */
var BASE_DIR = 'services/gateway-service';

/* run service using nodemon */
gulp.task('services:gateway:serve', 'serve the gateway-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});


/* run service using plain node */
gulp.task('services:gateway:run', 'runs the gateway-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
