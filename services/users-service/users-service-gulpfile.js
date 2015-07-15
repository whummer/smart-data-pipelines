/**
 * Created by omoser on 16/04/15.
 */

var gulp = require('gulp');

//
// build path configuration
//
var BASE_DIR = 'services/users-service';

//
// General settings
//
var settings = {
	port: '8084'
};

//
// run service using nodemon
//
gulp.task('services:users:serve', 'serve the streams-service  using nodemon', function () {
	process.env.PORT = settings.port;
	runCmd("nodemon", ["app.js"], BASE_DIR);

	// todo cannot use gulp-nodemon atm since require() returns only a static instance
	// (see https://github.com/JacksonGariety/gulp-nodemon/issues/6)
	/*return nodemon({
	 script: BASE_DIR + '/app.js',
	 env: { 'RIOX_ENV': 'development' , 'PORT' : dockerSettings.port}
	 });*/
});

gulp.task('services:users:run', 'runs the users-service', function () {
	process.env.PORT = settings.port;
	runCmd("node", ["app.js"], BASE_DIR);
});
