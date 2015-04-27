//
// require gulp and plugins
//
var gulp = require('gulp-help')(require('gulp'));
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var fs = require('fs');

var gulpFiles = {
	ui : require('./web-ui/web-ui-gulpfile'),
	streamService : require('./services/streams-service/streams-service-gulpfile'),
	usersService : require('./services/users-service/users-service-gulpfile'),
  analyticsService : require('./services/analytics-service/analytics-service-gulpfile')
}
var nodeDirs = ["services/users-service", "services/streams-service", "services/analytics-service",
                "services/test", 
                "services/riox-services-base", "web-ui"];
var bowerDirs = ["web-ui/lib"];

gulp.task('riox', 'start riox nodejs infrastructure', function() {
	runSequence('ui:livereload', 'services:streams:serve', 'services:users:serve', 'services:analytics:serve');
	//runSequence('ui:serve:nolivereload', 'services:streams:serve', 'services:users:serve');
});

gulp.task('deps:clean:all', 'clean all node_modules and bower_components directories', function() {
	nodeDirs.forEach(function(dir) {
		cleanNodeDir(dir);
	});
	bowerDirs.forEach(function(dir) {
		cleanBowerDir(dir);
	});
});

gulp.task('deps:clean:local', 'clean all local riox modules from all node_modules and bower_components directories', function() {
	var rioxModules = ["riox-services-base", "riox-shared"];
	var libDirs = nodeDirs.concat(bowerDirs);
	rioxModules.forEach(function(mod) {
		nodeDirs.forEach(function(dir) {
			cleanDir(dir + "/node_modules/" + mod);
		});
		bowerDirs.forEach(function(dir) {
			cleanDir(dir + "/bower_components/" + mod);
		});
	});
});

function cleanNodeDir(dir) {
	cleanDir(dir + "/node_modules");
}
function cleanBowerDir(dir) {
	cleanDir(dir + "/bower_components");
}
function cleanDir(dir) {
	console.log(dir);
	if(fs.existsSync(dir)) {
		console.log("Cleaning directory", dir);
		gulp.src(dir, {read: false}).pipe(clean());
	}
}
