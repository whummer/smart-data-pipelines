//
// require gulp and plugins
//
var gulp = require('gulp'),
		gls = require('gulp-live-server'),
		bowerFiles = require('main-bower-files'),
		less = require('gulp-less'),
		path = require('path'),
		inject = require('gulp-inject'),
		angular_filesort = require('gulp-angular-filesort'),
		del = require('del'),
		rename = require('gulp-rename'),
		replace = require('gulp-replace'),
		clean = require('gulp-clean'),
		util = require('gulp-util'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		gulpFilter = require('gulp-filter'),
		sourcemaps = require('gulp-sourcemaps'),
		imagemin = require('gulp-imagemin'),
		runSequence = require('run-sequence'),
		es = require('event-stream');

//var $ = require('gulp-load-plugins')();

//
// build path configuration
//
var UI_BASE_DIR = 'web-ui';
var UI_SRC_DIR = UI_BASE_DIR + '/lib';
var UI_BUILD_DIR = UI_BASE_DIR + '/build';
var UI_BUILD_DIR_TEST = UI_BASE_DIR + '/build/test';
var UI_BUILD_DIR_PROD = UI_BASE_DIR + '/build/prod';

var paths = {
	// app base
	base: UI_SRC_DIR,

	// do not inject '.spec.js' files
	scripts: [UI_SRC_DIR + '/app/**/*.js', '!' + UI_SRC_DIR + '/app/**/*.spec.js'],

	// glob for all LESS files (required for file watching)
	less: [UI_SRC_DIR + '/app/styles/less/*.less'],

	// glob for all CSS files
	css: [UI_SRC_DIR + '/app/styles/css/**/*.css'],

	// "main" LESS file (the one that imports all other less files)
	less_main: [UI_SRC_DIR + '/app/app.less'],

	// images (for optimization by imagemin)
	images: UI_SRC_DIR + '/app/components/img/**/*',

	// html files / views
	html: UI_SRC_DIR + "/app/**/*.html",

	// "main" (index.html) file
	main: UI_SRC_DIR + '/index.tmpl.html',

	// all in one concatenated and minified JS files
	minified_js : UI_BUILD_DIR_PROD + "/app/components/js/riox.all.min.js",

	// Dockerfile template
	dockerfile : UI_BASE_DIR + "/Dockerfile.tmpl"
};

//
// Dockerfile settings
//
var dockerSettings = {
	web_ui : {
		port : '8080'
	}
};

//
// gulp task definitions
//
gulp.task('default', function () {
	util.log("Howdi this is Riox' gulpfile for fun and profit!")
});

//
// clean output directories
//
gulp.task('clean', function () {
	return gulp.src(UI_BUILD_DIR, {read:false}).pipe(clean());
});

//
// Copy files for TEST and PROD
//
gulp.task('copy:test', function () {
	return gulp.src([
			UI_SRC_DIR + '/**',
			'!' + "/**/*.less",
			'!' + "/**/index.tmpl.html",
			'!' + UI_SRC_DIR + '/app/styles/less{,/**}'
		]).pipe(gulp.dest(UI_BUILD_DIR_TEST));
});

gulp.task('copy:prod', function () {
	return gulp.src([
			UI_SRC_DIR + '/**',
			'!' + "/**/*.less",
			'!' + "index.tmpl.html",
			'!' + UI_SRC_DIR + '/app/styles/less{,/**}',
			'!' + UI_SRC_DIR + '/app/components/js{,/**}'
	]).pipe(gulp.dest(UI_BUILD_DIR_PROD));
});

//
// compile LESS files to CSS
//
gulp.task('less', function () {
	return less2css();
});

function less2css(target) {
	util.log('Compiling LESS files to CSS (' + util.colors.magenta(paths.less_main) + ')');
	return gulp.src(paths.less_main)
			.pipe(less())
			.pipe(gulp.dest(target));
}

//
// inject resources (CSS, JS) into index.html
//
gulp.task('inject:dev', function () {
	return injectResources(paths.base, paths.base + '/app', 'web-ui/lib')
});

gulp.task('inject:test', function () {
	return injectResources(UI_BUILD_DIR_TEST, paths.base + '/app', 'web-ui/lib')
});

gulp.task('inject:prod', function () {
	return injectResources(UI_BUILD_DIR_PROD, paths.base + '/app', ['web-ui/lib', 'web-ui/build/prod'], true)
});

function injectResources(indexLocation, cssLocation, ignorePath, minified) {
	var cssFiles = less2css(cssLocation);

	// todo om: check how we can do this right (not explicitly filtering those)
	var jqueryFilter = gulpFilter(['**', '!jquery.js']);
	var vectorMapFilter = gulpFilter(['**', '!**/jquery-jvectormap*.js']);

	var scripts = minified ? paths.minified_js : paths.scripts;

	return gulp.src(paths.main)

			.pipe(inject(
					gulp.src(bowerFiles({paths: UI_BASE_DIR}), {read: false})
							.pipe(jqueryFilter), {name: 'bower', ignorePath: ignorePath}))

			.pipe(inject(es.merge(
							cssFiles, // compiled less files
							gulp.src(paths.css), // plain CSS files
							gulp.src(scripts)
									.pipe(vectorMapFilter)
									.pipe(angular_filesort())), {ignorePath: ignorePath}))

			.pipe(rename('index.html'))// rename from index.tmpl.html to index.html

			.pipe(gulp.dest(indexLocation));
}

//
// Minify and copy all JavaScript (except vendor scripts)
// with sourcemaps all the way down
//
gulp.task('scriptsmin', function () {
	return gulp.src(paths.scripts)
			.pipe(angular_filesort())
			.pipe(sourcemaps.init())
			.pipe(concat('riox.all.min.js'))
			.pipe(uglify())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(UI_BUILD_DIR_PROD + '/app/components/js'));
});

//
// Copy and optimize all static images
//
gulp.task('imagemin', function () {
	return gulp.src(paths.images)
			.pipe(imagemin(
					{
						optimizationLevel: 3,
						progessive: true,
						interlaced: true
					}
			))

			.pipe(gulp.dest(UI_BUILD_DIR_PROD + '/app/components/img/'));
});

//
// serve DEV task for development
//
gulp.task('serve', ['inject:dev'],  function () {
	var server = gls.static(UI_SRC_DIR, 8888);
	server.start();
	util.log(util.colors.cyan("live server up and running"));
	//gulp.watch([paths.scripts, paths.main, paths.html], rebuild(server))
	gulp.watch([paths.scripts, paths.main, paths.html], function(whatChanged) {
		server.notify();
		if (whatChanged.type == 'changed') {
			util.log("Updated: ", whatChanged.path);
		}
	})
});

//
// build PROD
//
gulp.task('build:prod', function () {
	util.log(util.colors.green("Running PRODUCTION build (+imagemin)"));
	runSequence('clean', 'imagemin', 'scriptsmin', 'copy:prod', 'inject:prod');
});

//
// build PROD (no image optimization)
//
gulp.task('build:prod:noimagemin', [], function () {
	util.log(util.colors.green("Running PRODUCTION build"));
	runSequence('copy:prod', 'scriptsmin', 'inject:prod');
});

//
// build PROD (no image optimization)
//
gulp.task('build:test', function () {
	util.log(util.colors.green("Running TEST build"));
	runSequence('copy:test', 'inject:test');
});

//
// serve PROD task (to check build) - NO LIVE RELOAD
//
gulp.task('serve:prod', ['build:prod'],  function () {
	var server = gls.static(UI_BUILD_DIR_PROD, 8080);
	server.start();
	util.log(util.colors.cyan("PROD server up and running"));
});

//
// serve PROD task (to check build) - NO LIVE RELOAD
//
gulp.task('serve:test', ['build:test'],  function () {
	var server = gls.static(UI_BUILD_DIR_TEST, 8080);
	server.start();
	util.log(util.colors.cyan("TEST server up and running"));
});


//
// Docker tasks
//
gulp.task('docker:build:test', function() {
	util.log(util.colors.magenta("Building Docker image for TEST"));
	gulp.src(paths.dockerfile)
			.pipe(replace("%NODE_ENV%", "test"))
			.pipe(replace("%PORT%", dockerSettings.web_ui.port))
			.pipe(rename("Dockerfile"))
			.pipe(gulp.dest(UI_BASE_DIR));
});


gulp.task('watch:test', function() {
	gulp.watch([paths.scripts, paths.main, paths.html], function(what) {
		util.log(util.colors.red("Something changed: "), what);
	});

});

