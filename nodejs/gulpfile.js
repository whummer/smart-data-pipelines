//
// require gulp and plugins
//
var gulp = require('gulp-help')(require('gulp'));
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var fs = require('fs');
var cp = require('child_process');

var gulpFiles = {
	ui : require('./web-ui/web-ui-gulpfile'),
	streamService : require('./services/streams-service/streams-service-gulpfile'),
	usersService : require('./services/users-service/users-service-gulpfile'),
	analyticsService : require('./services/analytics-service/analytics-service-gulpfile'),
	filesService : require('./services/files-service/files-service-gulpfile')
}
var nodeDirs = [".", "services/test",
                "services/users-service", "services/streams-service", "services/analytics-service", "services/files-service",
                "services/riox-services-base", "web-ui"];
var bowerDirs = ["web-ui/lib"];

gulp.task('riox', 'start riox nodejs infrastructure', function() {
	runSequence('ui:livereload', 'services:streams:serve', 'services:users:serve',
			'services:analytics:serve', 'services:files:serve');
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

gulp.task('deps:install:global', 'parse all dependencies and devDependencies from package.json files and run npm install -g on them.', function() {
	var deps = {};
	nodeDirs.forEach(function(dir) {
		var f = JSON.parse(fs.readFileSync(dir + "/package.json"));
		for(var dep in f.dependencies) {
			var version = f.dependencies[dep];
			addDepToHash(deps, dep, version);
		}
		for(var dep in f.devDependencies) {
			var version = f.devDependencies[dep];
			addDepToHash(deps, dep, version);
		}
	});
	var str = "npm install --ignore-scripts -g";
	for(var key in deps) {
		str += " " + key + "@" + deps[key];
	}
	console.log("Running:", str);
	cp.exec(str, {env: process.env}, function (error, stdout, stderr) {
		if (error) {
			console.log("Cannot install node modules.", error);
		}
	});
});

function addDepToHash(deps, dep, version) {
	if(version.indexOf("./") >= 0) {
		/* local module path -> ignore! */
		console.log("INFO: Ignoring local module dependency '" + dep + "' with path '" + version + "'");
		return;
	}
	if(deps[dep] && deps[dep] != version) {
		console.log("WARN: Overwriting version of '" + dep + "' from '" + 
				deps[dep] + "' to '" + version + "'");
	}
	deps[dep] = version;
}

function cleanNodeDir(dir) {
	cleanDir(dir + "/node_modules");
}
function cleanBowerDir(dir) {
	cleanDir(dir + "/bower_components");
}
function cleanDir(dir) {
	if(fs.existsSync(dir)) {
		console.log("Cleaning directory", dir);
		gulp.src(dir, {read: false}).pipe(clean());
	}
}
