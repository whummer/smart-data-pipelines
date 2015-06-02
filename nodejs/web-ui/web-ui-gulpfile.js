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
		replace = require('gulp-replace'),
		clean = require('gulp-clean'),
		util = require('gulp-util'),
		uglify = require('gulp-uglify'),
		concat = require('gulp-concat'),
		livereload = require('gulp-livereload'),
		gulpFilter = require('gulp-filter'),
		sourcemaps = require('gulp-sourcemaps'),
		runSequence = require('run-sequence'),
		bower = require('gulp-bower'),
		es = require('event-stream');

//
// build path configuration
//
var BASE_DIR = 'web-ui';
var SRC_DIR = BASE_DIR + '/lib';
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
  minified_js: BUILD_DIR_PROD + "/app/components/js/riox.all.min.js",

};


//
// gulp task definitions
//
gulp.task('default', 'i\'m only here for the beer', function () {
  util.log(util.colors.green("Howdi. Nothing to expect from me. Only here for the beer!"));
});

//
// clean output directories
//
gulp.task('ui:clean', 'remove build directories', function () {
  return gulp.src(BUILD_DIR, {read: false}).pipe(clean());
});

//
// Copy files for TEST and PROD
//
gulp.task('ui:copy:test', 'copies riox-ui sources to TEST build dir', function () {
  return gulp.src([
    SRC_DIR + '/**',
    '!' + "/**/*.less",
    '!' + "/**/index.tmpl.html",
    '!' + SRC_DIR + '/app/styles/less{,/**}'
  ]).pipe(gulp.dest(BUILD_DIR_TEST));
});

gulp.task('ui:copy:prod', 'copies riox-ui sources to PRODUCTION build dir', function () {
  return gulp.src([
    SRC_DIR + '/**',
    '!' + "/**/*.less",
    '!' + "index.tmpl.html",
    '!' + SRC_DIR + '/app/styles/less{,/**}',
    '!' + SRC_DIR + '/app/components/js{,/**}'
  ]).pipe(gulp.dest(BUILD_DIR_PROD));
});

//
// compile LESS files to CSS
//
gulp.task('ui:less', 'compiles LESS to CSS', function () {
  return less2css();
});

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
  return injectResources(paths.base, paths.base + '/app', 'web-ui/lib')
});

gulp.task('ui:inject:test', 'inject resources (CSS, JS) into index.html (TEST)', function () {
  return injectResources(BUILD_DIR_TEST, paths.base + '/app', 'web-ui/lib')
});

gulp.task('ui:inject:prod', 'inject resources (CSS, JS) into index.html (PROD)', function () {
  return injectResources(BUILD_DIR_PROD, paths.base + '/app', ['web-ui/lib', 'web-ui/build/prod'], true)
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
// Minify and copy all JavaScript (except vendor scripts)
// with sourcemaps all the way down
//
gulp.task('ui:scriptsmin', 'concatenate, minify and uglify JS script sources', function () {
  return gulp.src(paths.scripts)
    .pipe(angular_filesort())
    .pipe(sourcemaps.init())
    .pipe(concat('riox.all.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(BUILD_DIR_PROD + '/app/components/js'));
});

//
// Copy and optimize all static images
//
/*gulp.task('ui:imagemin', 'optimize image size', function () {
  return gulp.src(paths.images)
    .pipe(imagemin(
      {
        optimizationLevel: 3,
        progessive: true,
        interlaced: true
      }
    ))

    .pipe(gulp.dest(BUILD_DIR_PROD + '/app/components/img/'));
});*/

//
// install bower files
//
gulp.task('ui:bower', 'install bower dependencies', function () {
  return bower({cwd: BASE_DIR}).pipe(gulp.dest(BASE_DIR + "/lib/bower_components"));
});

//
// install node modules
//
gulp.task('ui:node_modules', 'install required node modules', function () {
  return gulp.src([BASE_DIR + "/package.json"]).pipe(install());
});

//
// serve DEV task for development
//

//run app using nodemon
gulp.task('ui:serve', 'serve the riox-ui src using nodemon', function () {
  //runSequence('ui:bower', 'ui:node_modules', 'ui:inject:dev');
  runSequence('ui:bower', 'ui:inject:dev');

  return nodemon({
    script: SRC_DIR + '/server.js', verbose: false,
    watch: ["web-ui/lib"],
    ignore: ["web-ui/node_modules", "node_modules", "web-ui/lib/bower_components", "services/**/node_modules"],
    env: {NODE_PATH: process.env.NODE_PATH || "/opt/boxen/nodenv/versions/v0.12.2/lib/node_modules", NODE_ENV: "development", PORT: 8081}
  });
});

// livereload browser on client app changes
gulp.task('ui:livereload', 'serve the riox-ui using nodemon (with livereload)', ['ui:serve'], function () {
  livereload();
  livereload.listen();
  var all_build_files = SRC_DIR + '/app/**/*';
  gulp.watch(paths.less, ['ui:inject:dev']);
  return gulp.watch(all_build_files, function (whatChanged) {
    if (whatChanged.type == 'changed') {
      util.log("Updated: ", whatChanged.path);
    }

    livereload.changed(whatChanged.path);
  });
});


//
// build PROD
//
gulp.task('ui:build:prod', 'create a PRODUCTION build of riox-ui', function () {
  util.log(util.colors.green("Running PRODUCTION build (+imagemin)"));
  //runSequence('ui:clean', 'ui:imagemin', 'ui:scriptsmin', 'ui:copy:prod', 'ui:inject:prod');
  runSequence('ui:clean', 'ui:scriptsmin', 'ui:copy:prod', 'ui:inject:prod');
});

//
// build PROD (no image optimization)
//
gulp.task('ui:build:prod:noimagemin', 'create a PRODUCTION build of riox-ui (NO image optimization)', function () {
  util.log(util.colors.green("Running PRODUCTION build"));
  runSequence('ui:copy:prod', 'ui:scriptsmin', 'ui:inject:prod');
});

//
// build PROD (no image optimization)
//
gulp.task('ui:build:test', 'create a TEST build of riox-ui', function () {
  runSequence('ui:copy:test', 'ui:inject:test');
});

//
// serve PROD build task (to check build) - NO LIVE RELOAD
//
gulp.task('ui:serve:prod', 'serve the PRODUCTION build of riox-ui (8080)', ['ui:build:prod'], function () {
  return nodemon({
    script: BUILD_DIR_PROD + '/server.js',
    env: {'NODE_ENV': 'production', 'PORT': 8080},
    options: '-i ' + BUILD_DIR_PROD + "/*"
  });
});

//
// serve TEST build task (to check build) - NO LIVE RELOAD
//
gulp.task('ui:serve:test', 'serve the TEST build of riox-ui (8080)', ['ui:build:test'], function () {
  return nodemon({
    script: BUILD_DIR_TEST + '/server.js',
    env: {'NODE_ENV': 'test', 'PORT': 8080}
    //options: '-i ' + BUILD_DIR_TEST + "/*"
  });
});




