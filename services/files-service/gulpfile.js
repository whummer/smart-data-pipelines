/**
 * Created by whummer
 */

var gulp = require('gulp');
var mocha = require('gulp-mocha')

//
// build path configuration
//
var BASE_DIR = 'services/files-service';
var TEST_DIR = BASE_DIR + '/test/unit';
var TEST_REPORTER = process.env.TEST_REPORTER ||  'spec'

gulp.task('services:files:test:unit', 'runs the files-service unit tests', function () {
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

//
// run service using nodemon
//
gulp.task('services:files:serve', 'serve the files-service using nodemon', function () {
	runCmd("nodemon", ["app.js"], BASE_DIR);
});

gulp.task('services:files:run', 'runs the files-service', function () {
	runCmd("node", ["app.js"], BASE_DIR);
});
