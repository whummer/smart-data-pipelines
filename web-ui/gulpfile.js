//
// require gulp and plugins
//
var gulp = require('gulp-help')(require('gulp')),
	nodemon = require('gulp-nodemon'),
	bowerFiles = require('main-bower-files'),
	less = require('gulp-less'),
	path = require('path'),
	inject = require('gulp-inject'),
	angular_filesort = require('gulp-angular-filesort'),
	cp = require('child_process'),
	rename = require('gulp-rename'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	util = require('gulp-util'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	livereload = require('gulp-livereload'),
	gulpFilter = require('gulp-filter'),
	sourcemaps = require('gulp-sourcemaps'),
	runSequence = require('run-sequence'),
	babel = require('gulp-babel'),
	es = require('event-stream');

//
// build path configuration
//
var BASE_DIR = 'web-ui';
var SRC_DIR = BASE_DIR + '/lib';
var BUILD_DIR = BASE_DIR + '/build';
var BUILD_DIR_DEV = BUILD_DIR + '/development';
var BUILD_DIR_TEST = BUILD_DIR + '/test';
var BUILD_DIR_PROD = BUILD_DIR + '/production';

var paths = {
	// app base
	base: SRC_DIR,

	// inject js files
	scripts: [
		'/app/**/*.js',
		'!/app/**/*.spec.js', // do not inject '.spec.js' files
		'!/app/views/admin/**/*.js'], 		// do not inject admin view files

	// glob for all LESS files (required for file watching)
	less: [SRC_DIR + '/app/**/*.less'],

	// glob for all LESS files (required for file watching)
	less_includes: [SRC_DIR + '/app/styles/less/*.less'],

	// glob for LESS files in views directory
	less_in_views: SRC_DIR + '/app/**/*.less',

	// glob for all CSS files
	css: [SRC_DIR + '/app/styles/css/**/*.css', SRC_DIR + '/app/views/**/*.css', SRC_DIR + '/app/app.css'],

	// "main" LESS file (the one that imports all other less files)
	less_main: SRC_DIR + '/app/app.less',

	// images (for optimization by imagemin)
	images: SRC_DIR + '/app/components/img/**/*',

	// html files / views
	html: SRC_DIR + "/app/**/*.html",

	// "main" (index.html) file
	main: SRC_DIR + '/index.tmpl.html',

	// all in one concatenated and minified JS files
	minified_js: BUILD_DIR_PROD + "/app/components/js/riox.all.min.js",

};

//
// gulp task definitions
//
gulp.task('default', 'i\'m only here for the beer', function () {
	util.log(util.colors.bold("Howdi. Nothing to expect from me. Only here for the beer!"));
});

//
// clean output directories
//
gulp.task('ui:clean', 'remove build directories', function () {
	return gulp.src(BUILD_DIR, {read: false}).pipe(vinylPaths(del));
});

//
//
// COPY TASKS. These tasks copy all required resources to the "build" directory
//
//
gulp.task('ui:copy:dev', 'copies riox-ui sources to DEV build dir', function (done) {
	copyResources(BUILD_DIR_DEV, done);
});


gulp.task('ui:copy:test', 'copies riox-ui sources to TEST build dir', function (done) {
	copyResources(BUILD_DIR_TEST, done)
});


gulp.task('ui:copy:prod', 'copies riox-ui sources to PRODUCTION build dir', function (done) {
	copyResources(BUILD_DIR_PROD, done);
});

//
// copy the resources, depends on given destination directory
//
function copyResources(destinationDirectory, done) {
	util.log(util.colors.green("Copying resources from " + SRC_DIR + " to " + destinationDirectory));

	var resources = [
		SRC_DIR + '/**',
		'!' + "/**/*.less",
		'!' + "/**/index.tmpl.html",
		'!' + SRC_DIR + '/app/styles/less{,/**}'
	];

	// for production build we include the minified version of the scripts, so skip the following directory
	/*if (destinationDirectory === BUILD_DIR_PROD) {
		resources.push('!' + SRC_DIR + '/app/components/js{,/!**}');
	}
*/
	util.log(util.colors.grey("Resources to copy: " + resources));

	gulp.src(resources)
		.pipe(gulp.dest(destinationDirectory))
		.on("end", function () {
			done();
		});
}

//
// compile LESS files to CSS
//
gulp.task('ui:less', 'compiles LESS to CSS', function () {
	return less2css(paths.base + '/app');
});

function less2css(target) {
	console.log('Compiling LESS files to CSS (' + util.colors.magenta(paths.less_main) + ',' + target + ')');
	return gulp.src([paths.less_main, paths.less_in_views, '!' + paths.less_includes])
		.pipe(less())
		.pipe(gulp.dest(target));
}

//
//
// inject resources (CSS, JS) into index.html
//
//
gulp.task('ui:inject:dev', 'inject resources (CSS, JS) into index.html (DEV)', function (done) {
	var ignorePaths = ['web-ui/lib', 'web-ui/build/development'];
	return injectResources(BUILD_DIR_DEV, paths.base + '/app', ignorePaths, false, done);
});

gulp.task('ui:inject:test', 'inject resources (CSS, JS) into index.html (TEST)', function (done) {
	var ignorePaths = ['web-ui/lib', 'web-ui/build/test'];
	return injectResources(BUILD_DIR_TEST, paths.base + '/app', ignorePaths, false, done);
});

gulp.task('ui:inject:prod', 'inject resources (CSS, JS) into index.html (PROD)', function (done) {
	var ignorePaths = ['web-ui/lib', 'web-ui/build/production'];
	return injectResources(BUILD_DIR_PROD, paths.base + '/app', ignorePaths, true, done);
});


function injectResources(buildDir, cssLocation, ignorePath, minified, done) {
	var cssFiles = less2css(cssLocation);

	util.log(util.colors.green('Injecting resources into ' + buildDir));

	// todo om: check how we can do this right (not explicitly filtering those)
	var jqueryFilter = gulpFilter(['**', '!jquery.js']);
	var vectorMapFilter = gulpFilter(['**', '!**/jquery-jvectormap*.js']);
	var aceFilter = gulpFilter(['**', '!**/ace.js']);

	// we need to add the buildDir in front of the script sources at this point since we
	// already copied the scripts to the build dir
	var scripts;
	if (minified) {
		scripts = paths.minified_js;
	} else {
		scripts = getRealScriptsPaths(buildDir);
	}

	util.log(util.colors.green('Using scripts for injection: ' + scripts));

	var bowerConfig = {
		paths: {
			bowerDirectory: BASE_DIR + '/lib/bower_components',
			bowerJson: BASE_DIR + '/bower.json',
			bowerRc: BASE_DIR + '/.bowerrc'
		}
	};

	gulp.src(paths.main)

		.pipe(inject(gulp.src(bowerFiles(bowerConfig), {read: false})
			.pipe(jqueryFilter), {name: 'bower', ignorePath: ignorePath}))

		.pipe(inject(es.merge(
			cssFiles, // compiled less files
			gulp.src(paths.css), // plain CSS files
			gulp.src(scripts)
				.pipe(aceFilter)
				.pipe(vectorMapFilter)
				.pipe(angular_filesort())), {ignorePath: ignorePath}))

		.pipe(rename('index.html'))// rename from index.tmpl.html to index.html
		.pipe(gulp.dest(buildDir))
		.on("end", function () {
			if (done) done();
		});
}

//
//
// transpiling configuration
//
//

gulp.task('ui:babel:dev', function () {
	return runBabel(BUILD_DIR_DEV);
});

gulp.task('ui:babel:test', function () {
	return runBabel(BUILD_DIR_TEST);
});

gulp.task('ui:babel:prod', function () {
	return runBabel(BUILD_DIR_PROD);
});

function runBabel(buildDir) {
	util.log(util.colors.green("Running BABEL for build dir " + buildDir));

	return gulp.src(SRC_DIR + "/app/**/*.js")
		.pipe(babel())
		.pipe(gulp.dest(buildDir + "/app"));
}


//
//
// Minify and copy all JavaScript (except vendor scripts) with sourcemaps all the way down
//
//
gulp.task('ui:scriptsmin', 'concatenate, minify and uglify JS script sources', function (done) {
	var vectorMapFilter = gulpFilter(['**', '!**/jquery-jvectormap*.js']);
	var aceFilter = gulpFilter(['**', '!**/ace.js']);

	gulp.src(getRealScriptsPaths(BUILD_DIR_PROD))
		.pipe(aceFilter)
		.pipe(vectorMapFilter)
		.pipe(angular_filesort())
		.pipe(sourcemaps.init())
		.pipe(concat('riox.all.min.js'))
		.pipe(uglify({mangle: false, compress: {sequences: false}}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(BUILD_DIR_PROD + '/app/components/js'))
		.on("end", function () {
			done();
		});
});

//
// scripts helper for inject and scriptsmin tasks
//
function getRealScriptsPaths(baseDir) {
	return paths.scripts.map(function (script) {
		if (script.charAt(0) == '!') {
			return '!' + baseDir + script.substr(1);
		} else {
			return baseDir + script;
		}
	});
}

//
// install bower files
//
gulp.task('ui:bower', 'install bower dependencies', function (done) {
	runCmdSync("rm",  ['-rf', 'lib/bower_components/riox-shared'], __dirname);
	runCmdSync("bower", ["install", "--allow-root"], __dirname);
	done();
});

//
//
// serve DEV task for development
//
//

//
// run dev build and serve UI via nodemon
//
gulp.task('ui:serve:dev', 'serve the riox-ui src using nodemon', function (done) {
	util.log(util.colors.green("Running DEVELOPMENT build"));
	runSequence('ui:build:dev', 'ui:nodemon:dev', done);
});

//
// starts the DEV build with nodemon.
//
gulp.task('ui:nodemon:dev', 'start nodemon for DEV', function (done) {
	util.log("Starting nodemon for DEV");
	nodemon({
		script: BUILD_DIR_DEV + '/server.js', verbose: true,
		watch: [SRC_DIR + '/**/*'],
		ignore: [SRC_DIR + "/bower_components/**/*"],
		env: {
			NODE_PATH: process.env.NODE_PATH || "/opt/boxen/nodenv/versions/v0.12.7/lib/node_modules",
			NODE_ENV: "development",
			PORT: 8081
		},
		tasks: ['ui:build:dev']
	}).on('restart', function (changedFiles) {
		if (livereload && livereload.server) {
			util.log(util.colors.magenta('[nodemon] Reloading file via livereload: ', changedFiles));
			livereload.changed(changedFiles);
		}
	});

	done();

});

//
// livereload browser on client app changes
//
gulp.task('ui:livereload', 'serve the riox-ui using nodemon (with livereload)', ['ui:serve:dev'], function () {
	util.log(util.colors.green("Starting LIVERELOAD"));
	livereload();
	livereload.listen();
});

//
//
// Main BUILD tasks for various environments
//
//

//
// build DEV
//
gulp.task('ui:build:dev', 'create a DEVELOPMENT build of riox-ui', function (done) {
	util.log(util.colors.green("Running DEVELOPMENT build"));
	runSequence('ui:clean', 'ui:bower', 'ui:copy:dev', 'ui:babel:dev', 'ui:inject:dev', done);
});

//
// build TEST
//
gulp.task('ui:build:test', 'create a TEST build of riox-ui', function (done) {
	util.log(util.colors.green("Running TEST build"));
	runSequence('ui:clean', 'ui:bower', 'ui:copy:test', 'ui:babel:test', 'ui:inject:test', done);
});

//
// build PROD
//
gulp.task('ui:build:prod', 'create a PRODUCTION build of riox-ui', function (done) {
	util.log(util.colors.green("Running PRODUCTION build"));
	runSequence('ui:clean', 'ui:bower', 'ui:copy:prod', 'ui:babel:prod', 'ui:scriptsmin', 'ui:inject:prod', done);
});

//
//
// SERVE tasks
//
//

//
// serve PROD build task (to check build) - NO LIVE RELOAD
//
gulp.task('ui:serve:prod', 'serve the PRODUCTION build of riox-ui (8081)', ['ui:build:prod'], function (done) {
	var env = process.env;
	env.NODE_ENV = "production";
	env.PORT = "8081";
	runCmd("node", [BUILD_DIR_PROD + '/server.js'], __dirname + "/..", env);
	done();
});

//
// serve TEST build task (to check build) - NO LIVE RELOAD
//
gulp.task('ui:serve:test', 'serve the TEST build of riox-ui (8081)', ['ui:build:test'], function (done) {
	var env = process.env;
	env.NODE_ENV = "test";
	env.PORT = "8081";
	runCmd("node", [BUILD_DIR_TEST + '/server.js'], __dirname + "/..", env);
	done();
});
