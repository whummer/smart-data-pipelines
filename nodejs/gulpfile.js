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
		util = require('gulp-util'),
		es = require('event-stream');

// for later use
/*sourcemaps = require('gulp-sourcemaps'),
 imagemin = require('gulp-imagemin')*/


//
// build path configuration
//
var UI_SRC_DIR  = 'web-ui/src';
var UI_BUILD_DIR = 'web-ui/build/dev'; // for now todo

var paths = {
	// app base
	base: UI_SRC_DIR,

	// do not inject '.spec.js' files
	scripts: [ UI_SRC_DIR + '/app/**/*.js', '!' + UI_SRC_DIR + '/app/**/*.spec.js'],

	// glob for all LESS files (required for file watching)
	less: [ UI_SRC_DIR + '/app/styles/less/*.less'],

	// glob for all CSS files
	css : [UI_SRC_DIR + '/app/styles/css/**/*.css'],

	// "main" LESS file (the one that imports all other less files)
	app_less: [ UI_SRC_DIR + '/app/app.less'],

	// images (for optimization by imagemin)
	images: UI_SRC_DIR + '/app/components/img/**/*',

	// html files / views
	html : UI_SRC_DIR + "/app/**/*.html",

	// "main" (index.html) file
	main: UI_SRC_DIR + '/index.html'
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
gulp.task('clean', function() {
	del(['web-ui/build'], function (err, deletedFiles) {
		util.log(util.colors.red('Files deleted:', deletedFiles.join(', ')));
	});
});


//
// serve task for development
//
gulp.task('serve', function() {
	var server = gls.static(UI_SRC_DIR, 8888);
	server.start();
	util.log(util.colors.cyan("live server up and running"));
	gulp.watch([paths.scripts, paths.main, paths.html], server.notify)
});

//
// Copy all files at the root level (app)
//
gulp.task('copy', function () {
	return gulp.src(UI_SRC_DIR + '/app/*')
			.pipe(gulp.dest(UI_BUILD_DIR));
});

// Copy web fonts to dist
gulp.task('fonts', function () {
	return gulp.src(['app/fonts/**'])
			.pipe(gulp.dest('dist/fonts'));
});

//
// compile LESS files to CSS
//
gulp.task('less', function () {
	return less2css();
});

function less2css() {
	util.log('Compiling LESS files to CSS (' + util.colors.magenta(paths.app_less) + ')');
	return gulp.src(paths.app_less)
			.pipe(less())
			.pipe(gulp.dest(UI_BUILD_DIR + '/app'));
}

//
// inject resources (CSS, JS) into index.html
//
gulp.task('inject', function() {
	var cssFiles = less2css();
	gulp.src(paths.main)
			.pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower', ignorePath: ['web-ui/src']}))
			.pipe(inject(es.merge(
					cssFiles,
					gulp.src(paths.css),
					gulp.src(paths.scripts).pipe(angular_filesort())
			),  {ignorePath: ['web-ui/src']}))
			.pipe(gulp.dest(UI_BUILD_DIR));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
	gulp.watch(paths.less, ['inject']);
});


