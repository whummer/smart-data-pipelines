//
// require gulp and plugins
//
var gulp = require('gulp-help')(require('gulp'));
var runSequence = require('run-sequence');

var gulpFiles = {
	ui : require('./web-ui/web-ui-gulpfile'),
	streamService : require('./services/streams-service/streams-service-gulpfile'),
	usersService : require('./services/users-service/users-service-gulpfile')
}


gulp.task('riox', 'start riox nodejs infrastructure', function() {
	runSequence('ui:livereload', 'services:streams:serve');
});
