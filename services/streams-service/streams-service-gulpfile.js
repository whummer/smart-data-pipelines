/**
 * Created by omoser on 16/04/15.
 */

var gulp = require('gulp');

//
// build path configuration
//
var BASE_DIR = 'services/streams-service';

//
// General settings
//
var settings = {
	port: '8085'
};

//
// run service using nodemon
//
gulp.task('services:streams:serve', 'serve the streams-service  using nodemon', function () {
	process.env.PORT = settings.port;
	runCmd("nodemon", ["app.js"], BASE_DIR);

	// todo cannot use gulp-nodemon atm since require() returns only a static instance
	// (see https://github.com/JacksonGariety/gulp-nodemon/issues/6)
	/*return nodemon({
		script: BASE_DIR + '/app.js',
		env: { 'RIOX_ENV': 'development' , 'PORT' : dockerSettings.port}
	});*/
});


gulp.task('services:streams:run', 'runs the streams-service', function () {
	process.env.PORT = settings.port;
	runCmd("node", ["app.js"], BASE_DIR);
});
