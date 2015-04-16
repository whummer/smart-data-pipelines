//
// require gulp and plugins
//
var gulp = require('gulp-help')(require('gulp')),
		webUi = require('./web-ui/web-ui-gulpfile');

var serviceGulps = {
	streamService : require('./services/streams-service/streams-service-gulpfile'),
	usersService : require('./services/users-service/users-service-gulpfile')
}






