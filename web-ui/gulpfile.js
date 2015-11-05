//
// require gulp and plugins
//

var gulp = global.gulp,
	nodemon = require('gulp-nodemon'),
	bowerFiles = require('main-bower-files'),
	less = require('gulp-less'),
	inject = require('gulp-inject'),
	angular_filesort = require('gulp-angular-filesort'),
	rename = require('gulp-rename'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	util = require('gulp-util'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	livereload = require('gulp-livereload'),
	gulpFilter = require('gulp-filter'),
	sourcemaps = require('gulp-sourcemaps'),
	runSequence = require('run-sequence'),
	babel = require('gulp-babel'),
	browserSync = require('browser-sync').create(),
	compress = require('compression'),
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
var RIOX_ALL_MIN_JS = "riox.all.min.js";
var RIOX_ALL_MIN_CSS = "riox.all.min.css";
var RIOX_DEPS_ALL_MIN_JS = "riox.deps.all.min.js";
var RIOX_DEPS_ALL_MIN_CSS = "riox.deps.all.min.css";

var BOWER_CONFIG = {
	paths: {
		bowerDirectory: BASE_DIR + '/lib/bower_components',
		bowerJson: BASE_DIR + '/bower.json',
		bowerRc: BASE_DIR + '/.bowerrc'
	}
};

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
	css: ['/app/styles/css/**/*.css', '/app/views/**/*.css', '/app/app.css'],

	// "main" LESS file (the one that imports all other less files)
	less_main: SRC_DIR + '/app/app.less',

	// images (for optimization by imagemin)
	images: SRC_DIR + '/app/components/img/**/*',

	// html files / views
	html: SRC_DIR + '/app/**/*.html',

	// "main" (index.html) file
	main: SRC_DIR + '/index.tmpl.html',

	// all in one concatenated and minified JS files
	minified_js: BUILD_DIR_PROD + '/app/' + RIOX_ALL_MIN_JS,

	// all of our riox CSS definitions in one concatenated and minified file
	minified_css: BUILD_DIR_PROD + '/app/' + RIOX_ALL_MIN_CSS,

	// all in one concatenated and minified JS files (bower dependencies)
	minified_deps_js: BUILD_DIR_PROD + '/app/' + RIOX_DEPS_ALL_MIN_JS,

	// all CSS definitions of bower_dependencies in one concatenated and minified file
	minified_deps_css: BUILD_DIR_PROD + '/app/' + RIOX_DEPS_ALL_MIN_CSS

};


//todo om: check how we can do this right (not explicitly filtering those)
var jqueryFilter = function() { return gulpFilter(['**', '!jquery.js']); };
var vectorMapFilter = function() { return gulpFilter(['**', '!**/jquery-jvectormap*.js']); };
var aceFilter = function() { return gulpFilter(['**', '!**/ace.js']); };
var bootstrapFilter = function() { return gulpFilter(['**', '!**/bootstrap.css']); };

//
// clean output directories
//
gulp.task('ui:clean', 'remove build directories', function () {
	return gulp.src(BUILD_DIR, {read: false}).pipe(vinylPaths(del));
});

//
// COPY TASKS. These tasks copy all required resources to the "build" directory
//
gulp.task('ui:copy:dev', 'copies riox-ui sources to DEV build dir', function (done) {
	copyResources(BUILD_DIR_DEV, done);
});


gulp.task('ui:copy:test', 'copies riox-ui sources to TEST build dir', function (done) {
	copyResources(BUILD_DIR_TEST, done);
});


gulp.task('ui:copy:prod', 'copies riox-ui sources to PRODUCTION build dir', function (done) {
	copyResources(BUILD_DIR_PROD, done);
});

//
// copy the resources, depends on given destination directory
//
function copyResources(destinationDirectory, done) {
	util.log(util.colors.green('Copying resources from ' + SRC_DIR + ' to ' + destinationDirectory));

	var resources = [
		SRC_DIR + '/**',
		'!' + '/**/*.less',
		'!' + '/**/index.tmpl.html',
		'!' + SRC_DIR + '/app/styles/less{,/**}'
	];


	util.log(util.colors.grey('Resources to copy: ' + resources));

	gulp.src(resources)
		.pipe(gulp.dest(destinationDirectory))
		.on('end', function () {
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
	var lessPaths = [paths.less_main, paths.less_in_views, '!' + paths.less_includes];
	util.log(util.colors.gray('Compiling LESS files to CSS (' + util.colors.magenta(lessPaths) + ' -> ' + target + ')'));
	return gulp.src(lessPaths)
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
	util.log(util.colors.green('Injecting resources into ' + buildDir));

	var cssFiles = less2css(cssLocation);

	// we need to add the buildDir in front of the script sources at
	// this point since we already copied the scripts to the build dir
	var scripts;
	if (minified) {
		scripts = paths.minified_js;
		util.log(util.colors.green('Using deps scripts for injection: ' + paths.minified_deps_js));
	} else {
		scripts = getRealScriptsPaths(buildDir);
		util.log(util.colors.green('Using source files from bower_components as dependencies'));
	}

	util.log(util.colors.green('Using scripts for injection: ' + scripts));

	gulp.src(paths.main)

		.pipe(inject(
			(minified ?
				gulp.src([paths.minified_deps_js, paths.minified_deps_css]) :
				gulp.src(bowerFiles(BOWER_CONFIG), {read: false}).pipe(jqueryFilter())
			), {name: 'bower', ignorePath: ignorePath}))

		.pipe(inject(
			(minified ?
				gulp.src([paths.minified_js, paths.minified_css]) :
				es.merge(
					cssFiles, // compiled less files
					gulp.src(getRealCssPaths(SRC_DIR)), // plain CSS files
					gulp.src(scripts)
						.pipe(aceFilter())
						.pipe(vectorMapFilter())
						.pipe(angular_filesort()))
			), {ignorePath: ignorePath}))

		.pipe(rename('index.html'))// rename from index.tmpl.html to index.html
		.pipe(gulp.dest(buildDir))
		.on('end', function () {
			if (done) done();
		});
}

gulp.task('ui:changewatch', function () {
	changeWatch(false);
});

gulp.task('ui:changewatch:browsersync', function () {
	changeWatch(true);
});

function changeWatch(doUseBrowserSync) {
	// reload views
	gulp.watch(paths.html, function (changed) {
		gulp.src(changed.path, {base: SRC_DIR})
			.pipe(gulp.dest(BUILD_DIR_DEV))
			.on('end', function () {
				if(doUseBrowserSync)
					browserSync.reload();
			});
	});

	// reload LESS
	gulp.watch(paths.less, function () {
		less2css(paths.base + '/app')
			.pipe(gulp.dest(BUILD_DIR_DEV + '/app'))
			.on('end', function () {
				if(doUseBrowserSync)
					browserSync.reload();
			});
	});

	// reload JS
	gulp.watch(SRC_DIR + '/app/**/*.js', function (changed) {
		gulp.src(changed.path, {base: SRC_DIR})
			.pipe(babel({ presets: ['es2015'] }))
			.pipe(gulp.dest(BUILD_DIR_DEV))
			.on('end', function () {
				if(doUseBrowserSync)
					browserSync.reload();
			});
	});
}

//
//
// browsersync
//
//
gulp.task('ui:browsersync', function () {
	browserSync.init({
		logLevel: 'debug',
		proxy: {
			target: 'http://127.0.0.1:8081',
			middleware: [compress()],
			reqHeaders: function (config) {
				return {
					'host': 'platform.riox.io:8081'
				};
			}
		}
	});
});


//
//
// transpiling configuration
//
//

gulp.task('ui:babel:dev', 'Run babel transpiler for DEV build', function () {
	return runBabel(BUILD_DIR_DEV);
});

gulp.task('ui:babel:test', 'Run babel transpiler for TEST build', function () {
	return runBabel(BUILD_DIR_TEST);
});

gulp.task('ui:babel:prod', 'Run babel transpiler for PROD build', function () {
	return runBabel(BUILD_DIR_PROD);
});

function runBabel(buildDir) {
	util.log(util.colors.green('Running BABEL for build dir ' + buildDir));

	return gulp
		.src(SRC_DIR + '/app/**/*.js')
		.pipe(babel({ presets: ['es2015'] })) 
		.pipe(gulp.dest(buildDir + '/app'));
}


//
//
// Minify and copy all JavaScript (except vendor scripts) with sourcemaps all the way down
//
//
gulp.task('ui:scriptsmin', 'concatenate, minify and uglify JS script sources', function (done) {
	function minOwnScripts() {
		return gulp.src(getRealScriptsPaths(BUILD_DIR_PROD))
			.pipe(aceFilter())
			.pipe(vectorMapFilter())
			.pipe(angular_filesort())
			.pipe(sourcemaps.init()) // TODO whu: not sure we need this?
			.pipe(concat(RIOX_ALL_MIN_JS))
			.pipe(uglify({mangle: false, compress: {sequences: false}}))
			.pipe(sourcemaps.write()) // TODO whu: not sure we need this?
			.pipe(gulp.dest(BUILD_DIR_PROD + '/app'));
	}
	function minDepsScripts() {
		return gulp.src(bowerFiles(BOWER_CONFIG))
			.pipe(gulpFilter('*.js'))
			.pipe(jqueryFilter())
			.pipe(concat(RIOX_DEPS_ALL_MIN_JS))
			.pipe(uglify({mangle: false, compress: {sequences: false}}))
			.pipe(gulp.dest(BUILD_DIR_PROD + '/app'));
	}
	function minOwnCss() {
		return gulp.src(getRealCssPaths(BUILD_DIR_PROD))
			.pipe(gulpFilter('*.css'))
			.pipe(concat(RIOX_ALL_MIN_CSS))
			.pipe(minifyCss())
			.pipe(gulp.dest(BUILD_DIR_PROD + '/app'));
	}
	function minDepsCss() {
		return gulp.src(bowerFiles(BOWER_CONFIG))
			.pipe(gulpFilter('*.css'))
			.pipe(bootstrapFilter())
			.pipe(concat(RIOX_DEPS_ALL_MIN_CSS))
			.pipe(minifyCss())
			.pipe(gulp.dest(BUILD_DIR_PROD + '/app'));
	}

	minOwnScripts().on('end', function () {
		minDepsScripts().on('end', function () {
			minOwnCss().on('end', function () {
				minDepsCss().on('end', function () {
					done();
				});
			});
		});
	});
});

//
// scripts helper for inject and scriptsmin tasks
//
function getRealScriptsPaths(baseDir) {
	return getRealPaths(paths.scripts, baseDir);
}
function getRealCssPaths(baseDir) {
	return getRealPaths(paths.css, baseDir);
}
function getRealPaths(thePaths, baseDir) {
	return thePaths.map(function (file) {
		if (file.charAt(0) == '!') {
			return '!' + baseDir + file.substr(1);
		} else {
			return baseDir + file;
		}
	});
}

//
// install bower files
//
gulp.task('ui:bower', 'install bower dependencies', function (done) {
	runCmdSync('rm', ['-rf', 'lib/bower_components/riox-shared'], __dirname);
	var result = runCmdSync('bower', ['install', '--allow-root'], __dirname);
	if(result.status !== 0) {
		util.log(util.colors.red('Error: Bower run returned error exit code: ' + result.status + "."));
		return process.exit(result.status);
	}
	done();
});

//
//
// serve DEV task for development
//
//


//
// starts the DEV build with nodemon.
//
gulp.task('ui:serve:dev', 'start nodemon for DEV', function (done) {
	util.log('Starting nodemon for DEV');
	nodemon({
		verbose: true,
		script: BUILD_DIR_DEV + '/server.js',
		ext: 'html js',
		watch: [SRC_DIR + '/!**!/!*'],
		ignore: [SRC_DIR + '/bower_components/!**!/!*'],
		env: {
			NODE_PATH: process.env.NODE_PATH || '/opt/boxen/nodenv/versions/v0.12.7/lib/node_modules',
			NODE_ENV: 'development',
			PORT: 8081
		}
	});

	done();
});

//
// livereload on client app changes
//
gulp.task('ui:livereload', 'serve the riox-ui with live reloading of file changes',function (done) {
	util.log(util.colors.green('Running DEVELOPMENT build'));
	runSequence('ui:build:dev', 'ui:serve:dev', 'ui:changewatch', done);
});

//
// livereload on client app changes, including browsersync
//
gulp.task('ui:livereload:browsersync', 'serve the riox-ui with live reloading of file changes (and with browsersync)',function (done) {
	util.log(util.colors.green('Running DEVELOPMENT build'));
	runSequence('ui:build:dev', 'ui:serve:dev', 'ui:browsersync', 'ui:changewatch:browsersync', done);
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
	util.log(util.colors.green('Running DEVELOPMENT build'));
	runSequence('ui:bower', 'ui:copy:dev', 'ui:babel:dev', 'ui:inject:dev', done);
});

gulp.task('ui:rebuild:dev', 'create a DEVELOPMENT build of riox-ui', function (done) {
	util.log(util.colors.green('Running DEVELOPMENT build'));
	runSequence('ui:copy:dev', 'ui:babel:dev', 'ui:inject:dev', done);
});

//
// build TEST
//
gulp.task('ui:build:test', 'create a TEST build of riox-ui', function (done) {
	util.log(util.colors.green('Running TEST build'));
	runSequence('ui:clean', 'ui:bower', 'ui:copy:test', 'ui:babel:test', 'ui:inject:test', done);
});

//
// build PROD
//
gulp.task('ui:build:prod', 'create a PRODUCTION build of riox-ui', function (done) {
	util.log(util.colors.green('Running PRODUCTION build'));
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
gulp.task('ui:serve:prod', 'serve the PRODUCTION build of riox-ui (8081)', function (done) {
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
