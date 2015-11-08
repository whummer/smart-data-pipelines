/**
 * Created by omoser on 16/04/15.
 */

require('babel-core/register');

var gulp = require('gulp');
var mocha = require('gulp-mocha')

/* build path configuration */
var BASE_DIR = 'services/pipes-service';
var TEST_DIR = process.env.TEST_RESULT_PATH || BASE_DIR + '/test/unit';
var TEST_REPORTER = process.env.TEST_REPORTER ||  'spec'

gulp.task('services:pipes:test:unit', 'runs the pipes-service unit tests', function () {
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
gulp.task('services:pipes:serve', 'serve the pipes-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});

/* run service using plain node */
gulp.task('services:pipes:run', 'runs the pipes-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
