//
// require gulp and plugins
//
var gulp = require('gulp-help')(require('gulp')),
		nodemon = require('gulp-nodemon'),
		bowerFiles = require('main-bower-files'),
		install = require('gulp-install'),
		less = require('gulp-less'),
		path = require('path'),
		inject = require('gulp-inject'),
		angular_filesort = require('gulp-angular-filesort'),
		cp = require('child_process'),
		rename = require('gulp-rename'),
		clean = require('gulp-clean'),
		util = require('gulp-util'),
		gulpFilter = require('gulp-filter'),
		runSequence = require('run-sequence'),
		bower = require('gulp-bower'),
		es = require('event-stream');


//
// build path configuration
//
var BASE_DIR = '.';
var SRC_DIR = BASE_DIR + '';
var BUILD_DIR = BASE_DIR + '/build';
var BUILD_DIR_TEST = BASE_DIR + '/build/test';
var BUILD_DIR_PROD = BASE_DIR + '/build/production';

var paths = {
  // app base
  base: SRC_DIR,

  // do not inject '.spec.js' files
  scripts: [SRC_DIR + '/app/**/*.js', '!' + SRC_DIR + '/app/**/*.spec.js'],

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
  minified_js: BUILD_DIR_PROD + "/app/components/js/riox.all.min.js"
};

//
// clean output directories
//
gulp.task('ui:clean', 'remove build directories', function () {
  return gulp.src(BUILD_DIR, {read: false}).pipe(clean());
});

// Build CSS
function less2css(target) {
  util.log('Compiling LESS files to CSS (' + util.colors.magenta(paths.less_main) + ')');
  return gulp.src([paths.less_main, paths.less_in_views, '!'  + paths.less_includes])
    .pipe(less())
    .pipe(gulp.dest(target));
}

//
// inject resources (CSS, JS) into index.html
//
gulp.task('ui:inject:dev', 'inject resources (CSS, JS) into index.html (DEV)', function () {
  return injectResources(paths.base, paths.base + '/app', '/')
});

function injectResources(indexLocation, cssLocation, ignorePath, minified) {
  var cssFiles = less2css(cssLocation);

  // todo om: check how we can do this right (not explicitly filtering those)
  var jqueryFilter = gulpFilter(['**', '!jquery.js']);
  var vectorMapFilter = gulpFilter(['**', '!**/jquery-jvectormap*.js']);
  var aceFilter = gulpFilter(['**', '!**/ace.js']);

  var scripts = minified ? paths.minified_js : paths.scripts;

  return gulp.src(paths.main)

    .pipe(inject(
      gulp.src(bowerFiles({paths: BASE_DIR}), {read: false})
        .pipe(jqueryFilter), {name: 'bower', ignorePath: ignorePath}))

    .pipe(inject(es.merge(
      cssFiles, // compiled less files
      gulp.src(paths.css), // plain CSS files
      gulp.src(scripts)
        .pipe(aceFilter)
        .pipe(vectorMapFilter)
        .pipe(angular_filesort())), {ignorePath: ignorePath}))

    .pipe(rename('index.html'))// rename from index.tmpl.html to index.html
    .pipe(gulp.dest(indexLocation));
}

//
// install bower files
//
gulp.task('ui:bower', 'install bower dependencies', function () {
  return bower({cwd: BASE_DIR}).pipe(gulp.dest(BASE_DIR + "/lib/bower_components"));
});

//run app using nodemon
gulp.task('ui:serve', 'serve the riox-ui src using nodemon', function () {
  runSequence('ui:bower', 'ui:inject:dev');

  return nodemon({
    script: SRC_DIR + '/server.js', verbose: false,
    watch: ["web-ui/lib"],
    ignore: ["web-ui/node_modules", "node_modules", "web-ui/lib/bower_components", "services/**/node_modules"],
    env: {NODE_ENV: "development", PORT: 9001}
  });
});
