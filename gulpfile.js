//
// require gulp and plugins
//
var gulp = global.gulp = require('gulp-help')(require('gulp'));
var del = require('del');
var vinylPaths = require('vinyl-paths');
var runSequence = require('run-sequence');
var fs = require('fs');
var cp = require('child_process');
var mocha = require('gulp-mocha')

var TEST_REPORTER = process.env.TEST_REPORTER ||  'spec'
var TEST_DIR = "services/test";


var gulpFiles = {
	ui: './web-ui/gulpfile',
	gateway: './gateway/gulpfile',
	pipesService: './services/pipes-service/gulpfile',
	usersService: './services/users-service/gulpfile',
	gatewayService: './services/gateway-service/gulpfile',
	accessService: './services/access-service/gulpfile',
	pricingService: './services/pricing-service/gulpfile',
	analyticsService: './services/analytics-service/gulpfile',
	filesService: './services/files-service/gulpfile',
	demoServices: './demo/gulpfile'
}
for(var key in gulpFiles) {
	try {
		require(gulpFiles[key]);
	} catch(e) {
		//console.log(e);
		/* dependency missing -> swallow */
	}
}

var nodeDirs = [".", "services/test", "gateway", "gateway/ext/http-proxy",
								"services/users-service", "services/access-service", "services/gateway-service",
								"services/pricing-service", "services/pipes-service", "services/analytics-service", "services/files-service",
								"services/riox-services-base", "web-ui"];
var bowerDirs = ["web-ui/lib"];

gulp.task('riox', 'start riox nodejs infrastructure', function() {
	runSequence('ui:livereload', 'services:pipes:serve', 'services:users:serve', 'services:pricing:serve',
			'services:analytics:serve', 'services:gateway:serve', 'services:access:serve', 'services:files:serve');
});

gulp.task('services:test:unit', 'run unit test of all the services', function() {
	runSequence('services:pipes:test:unit', 'services:users:test:unit', 'services:pricing:test:unit',
			 'services:analytics:test:unit', 'services:gateway:test:unit', 'services:access:test:unit', 'services:files:test:unit');
});

gulp.task('test:integration', 'run all integration test ', function() {
	return gulp.src(TEST_DIR + '/**/*.js', {read: false})
			.pipe(mocha({
					reporter: TEST_REPORTER,
					reporterOptions: {
							junit_report_name: "Integration Tests",
							junit_report_path: TEST_DIR + "/test-report.xml",
							junit_report_stack: 1
					},
					timeout: 15000
				}
			));
});

gulp.task('ui:bootstrap', 'Insert necessary data to boot the riox UI and make the riox APIs accessible.', function() {

	global.config = require("./services/users-service/config/environment");
	require('./services/riox-services-base/lib/api/service.calls');
	global.servicesConfig = global.config.services;
	var riox = require("./riox-shared/lib/api/riox-api");
	require("./riox-shared/lib/api/riox-api-admin")(riox);
	//global.config = require("./riox-services-base/lib/config/merge")(global.config, config);

	riox.users._bootstrap({}, function() {
		console.log("Successfully inserted users metadata");
		riox.proxies._bootstrap({}, function() {
			console.log("Successfully inserted APIs metadata");
			console.log("Done.");
		}, function(err) {
			console.log("ERROR: Unable to insert APIs metadata:", err);
		});
	}, function(err) {
		console.log("ERROR: Unable to insert users metadata:", err);
	});
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
		//console.log("INFO: Ignoring local module dependency '" + dep + "' with path '" + version + "'");
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
		gulp.src(dir, {read: false}).pipe(vinylPaths(del));
	}
}
global.runCmd = function(cmd, args, cwd, env) {
	var _cwd = cwd || __dirname;
	return cp.spawn(cmd, args,
			{env: env || process.env, cwd: _cwd, stdio: 'inherit'})
}
