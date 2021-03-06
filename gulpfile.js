//
// require gulp and plugins
//
var gulp = global.gulp = require('gulp-help')(require('gulp'));
var fs = require('fs');
var cp = require('child_process');

var TEST_REPORTER = process.env.TEST_REPORTER ||  'spec'
var TEST_DIR = "services/test";


var gulpFiles = {
	ui: './web-ui/gulpfile',
	pipesService: './services/pipes-service/gulpfile',
	usersService: './services/users-service/gulpfile',
	gatewayService: './services/gateway-service/gulpfile',
	accessService: './services/access-service/gulpfile',
	pricingService: './services/pricing-service/gulpfile',
	analyticsService: './services/analytics-service/gulpfile',
	filesService: './services/files-service/gulpfile',
	demoServices: './demo/gulpfile'
}
var depsMissing = false;
for(var key in gulpFiles) {
	var file = gulpFiles[key] + ".js";
	if(fs.existsSync(file)) {
		try {
			require(gulpFiles[key]);
		} catch(e) {
			depsMissing = true;
			console.log("including file: " + file, e);
			/* dependency missing -> swallow */
		}
	}
}
if(depsMissing) {
	console.log("WARN: Some dependencies are missing. Make sure to run 'make install-prereq' first.")
}

var nodeDirs = [".", "services/test",
								"services/users-service", "services/access-service", "services/gateway-service",
								"services/pricing-service", "services/pipes-service", "services/analytics-service", "services/files-service",
								"services/riox-services-base", "web-ui"];
var bowerDirs = ["web-ui/lib"];


gulp.task('riox', 'start riox nodejs infrastructure', function() {
	var runSequence = require('run-sequence');
	runSequence('ui:livereload', 'services:pipes:serve', 'services:users:serve', 'services:pricing:serve',
			'services:analytics:serve', 'services:gateway:serve', 'services:access:serve', 'services:files:serve');
});

gulp.task('services:test:unit', 'run unit test of all the services', function() {
	var runSequence = require('run-sequence');
	runSequence('services:pipes:test:unit', 'services:users:test:unit', 'services:pricing:test:unit',
			 'services:analytics:test:unit', 'services:gateway:test:unit', 'services:access:test:unit', 'services:files:test:unit');
});

gulp.task('test:integration', 'run all integration test ', function() {
	var mocha = require('gulp-mocha');
	var grep = ".*";
	try {
		var minimist = require('minimist');
		var options = minimist(process.argv.slice(2));
		grep = options.tests;
	} catch(e) {
		console.log("WARN: Unable to load npm module 'minimist'. Cannot select tests by regex.", e);
	}
	return gulp.src(TEST_DIR + '/test.integration.js', {read: false})
			.pipe(mocha({
					reporter: TEST_REPORTER,
					reporterOptions: {
							junit_report_name: "Integration Tests",
							junit_report_path: TEST_DIR + "/test-report.xml",
							junit_report_stack: 1
					},
					grep: grep,
					timeout: 10*60*1000,
					compilers: [
							'js:babel-core/register'
					]
			}));
});

gulp.task('ui:bootstrap', 'Insert necessary data to boot the riox UI and make the riox APIs accessible.', function() {

	global.config = require("./services/users-service/config/environment");
	require('./services/riox-services-base/lib/api/service.calls');
	global.servicesConfig = global.config.services;
	var riox = require("./riox-shared/lib/api/riox-api");
	require("./riox-shared/lib/api/riox-api-admin")(riox);

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
	cleanDir("web-ui/build/");
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
	var npmStr = "npm install --ignore-scripts -g";
	var maxDeps = 30;
	var depsArray = [];

	function doInstall(depsStr) {
		var cmdStr = npmStr + " " + depsStr;
		console.log("Running:", cmdStr);
		/* exec: synchronous call */
		cp.execSync(cmdStr, {env: process.env}, function (error, stdout, stderr) {
			if (error) {
				console.log("Cannot install node modules.", error);
			}
		});
	}

	/* get number of dependencies */
	var numDeps = 0;
	for(var key in deps) { numDeps++; }

	/* install dependencies in batches of N=maxDeps */
	var count = 0;
	var depsStr = "";
	for(var key in deps) {
		depsStr += key + "@" + deps[key] + " ";
		count += 1;
		if(count % maxDeps == 0 || count == numDeps) {
			doInstall(depsStr); /* synchronous call */
			depsStr = "";
		}
	}
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
	var del = require('del');
var vinylPaths = require('vinyl-paths');
	if(fs.existsSync(dir)) {
		console.log("Cleaning directory", dir);
		gulp.src(dir, {read: false}).pipe(vinylPaths(del));
	}
}

global.runCmd = function(cmd, args, cwd, env) {
	var _cwd = cwd || __dirname;
	return cp.spawn(cmd, args,
			{env: env || process.env, cwd: _cwd, stdio: 'inherit'})
};

global.runCmdSync = function(cmd, args, cwd, env) {
	var _cwd = cwd || __dirname;
	return cp.spawnSync(cmd, args,
			{env: env || process.env, cwd: _cwd, stdio: 'inherit'})
};
