
var gulp = require('gulp');

/* build path configuration */
var BASE_DIR = 'services/pricing-service';

/* run service using nodemon */
gulp.task('services:pricing:serve', 'serve the pricing-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});


/* run service using plain node */
gulp.task('services:pricing:run', 'runs the pricing-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
