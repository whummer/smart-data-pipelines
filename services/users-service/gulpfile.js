/**
 * Created by omoser on 16/04/15.
 */

var gulp = require('gulp');
var mocha = require('gulp-mocha')

//
// build path configuration
//
var BASE_DIR = 'services/users-service';
var TEST_DIR = BASE_DIR + '/test/unit';
var TEST_REPORTER = process.env.TEST_REPORTER ||  'spec'

gulp.task('services:users:test:unit', 'runs the users-service unit tests', function () {
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

gulp.task('services:users:serve', 'serve the users-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});

gulp.task('services:users:run', 'runs the users-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
