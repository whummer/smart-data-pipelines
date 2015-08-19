
var gulp = require('gulp');
var mocha = require('gulp-mocha')

/* build path configuration */
var BASE_DIR = 'services/pricing-service';
var TEST_DIR = BASE_DIR + '/test/unit';
var TEST_REPORTER = process.env.TEST_REPORTER ||  'spec'

gulp.task('services:pricing:test:unit', 'runs the pricing-service unit tests', function () {
	return gulp.src(TEST_DIR + '/**/*.js', {read: false})
			.pipe(mocha({
					reporter: TEST_REPORTER,
					reporterOptions: {
							junit_report_name: "Unit Tests: " + BASE_DIR,
							junit_report_path: TEST_DIR + "/test-report.xml",
							junit_report_stack: 1
					},
					timeout: 15000
				}
			));
});

/* run service using nodemon */
gulp.task('services:pricing:serve', 'serve the pricing-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});


/* run service using plain node */
gulp.task('services:pricing:run', 'runs the pricing-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
