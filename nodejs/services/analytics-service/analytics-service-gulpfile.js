/**
 * Created by omoser on 16/04/15.
 */

var gulp = require('gulp'),
		nodemon = require('gulp-nodemon'),
		less = require('gulp-less'),
		path = require('path'),
		cp = require('child_process'),
		rename = require('gulp-rename'),
		replace = require('gulp-replace'),
		clean = require('gulp-clean'),
		util = require('gulp-util'),
		gulpFilter = require('gulp-filter'),
		runSequence = require('run-sequence'),
		es = require('event-stream');

//
// build path configuration
//
var LIB_DIR = 'services/lib';
var BASE_DIR = 'services/analytics-service';
var BUILD_DIR = BASE_DIR + '/build';
var BUILD_DIR_TEST = BUILD_DIR + '/test';
var BUILD_DIR_PROD = BUILD_DIR + '/production';
var DOCKERFILE = "Dockerfile.tmpl";

//
// Dockerfile settings
//
var dockerSettings = {
	port: '8086' // TODO fr: this should come from the other config file
};

//
// clean output directories
//
gulp.task('services:analytics:clean', 'remove build directories', function () {
	return gulp.src(BUILD_DIR, {read: false}).pipe(clean());
});

//
// Build tasks for TEST and PROD
//
gulp.task('services:analytics:build:test', 'copies analytics-service sources to TEST build dir', function () {
	runSequence('services:analytics:copy:src:test', 'services:analytics:copy:lib:test');
});

function copySrc(target) {
	return gulp.src([BASE_DIR + '/**/*', '!' + BASE_DIR + "/build", '!' + BASE_DIR + "/node_modules/_"])
			.pipe(gulp.dest(target));
}

function copyLib(target) {
	return gulp.src([LIB_DIR + '/**/*'])
			.pipe(gulp.dest(target + '/lib'));
}
gulp.task('services:analytics:copy:src:test', 'copies stream service sources to TEST build dir', function () {
	copySrc(BUILD_DIR_TEST);
});

gulp.task('services:analytics:copy:lib:test', 'copies stream service libraries to TEST build dir', function () {
	copyLib(BUILD_DIR_TEST);
});


gulp.task('services:analytics:copy:prod', 'copies analytics-service sources to PRODUCTION build dir', function () {
	return gulp.src([BASE_DIR + '/**', '!' + BASE_DIR + "/build"])
			.pipe(gulp.dest(BUILD_DIR_PROD));
});

//
// run service using nodemon
//
gulp.task('services:analytics:serve', 'serve the analytics-service  using nodemon', function () {
	process.env.PORT = dockerSettings.port;
	return cp.spawn('nodemon',
			['app.js'],
			{env: process.env, cwd: BASE_DIR, stdio: 'inherit'})

	// todo cannot use gulp-nodemon atm since require() returns only a static instance
	// (see https://github.com/JacksonGariety/gulp-nodemon/issues/6)
	/*return nodemon({
		script: BASE_DIR + '/app.js',
		env: { 'NODE_ENV': 'development' , 'PORT' : dockerSettings.port}
	});*/
});

//
// Docker tasks
//
gulp.task('services:analytics:docker:build:test', 'build a Docker image from analytics-service TEST build', function () {
	util.log(util.colors.magenta("Building Docker image for TEST..."));
	runSequence('services:analytics:build:test', 'services:analytics:docker:build:test:dockerfile', 'services:analytics:docker:push', function () {
		util.log(util.colors.magenta("Built Docker image for TEST. Enjoy."));
	});
});

gulp.task('services:analytics:docker:build:prod', 'build a Docker image from analytics-service PRODUCTION build', function () {
	util.log(util.colors.magenta("Building Docker image for PRODUCTION..."));
	runSequence('services:analytics:build:prod', 'services:analytics:docker:build:prod:dockerfile', 'services:analytics:docker:push', function () {
		util.log(util.colors.magenta("Built Docker image for PRODUCTION. Enjoy."));
	});
});

gulp.task('services:analytics:docker:build:test:dockerfile', 'prepare a Dockerfile for analytics service  (TEST)', function () {
	return prepareDockerfile('test');
})

gulp.task('services:analytics:docker:build:prod:dockerfile', 'prepare a Dockerfile for analytics service (PRODUCTION)', function () {
	return prepareDockerfile('production');
});

function prepareDockerfile(env) {
	var dockerfileDest = path.join(BUILD_DIR, env);
	util.log('Preparing Dockerfile at ' + dockerfileDest);
	return gulp.src(path.join(BASE_DIR, DOCKERFILE))
			.pipe(replace("%NODE_ENV%", env))
			.pipe(replace("%PORT%", dockerSettings.port))
			.pipe(rename("Dockerfile"))
			.pipe(gulp.dest(dockerfileDest));
}

gulp.task('services:analytics:docker:push', function () {
	var _cwd = path.resolve(BASE_DIR + '/../..');
	var absoluteBuildDir = path.resolve(BUILD_DIR_TEST); // todo make for PROD too
	util.log('Executing docker build-push in dir ', _cwd);
	return cp.spawn('bin/docker-util.sh',
			['--no-push', '-i', 'riox/analytics-service', '-v', '-b', absoluteBuildDir],
			{env: process.env, cwd: _cwd, stdio: 'inherit'})
});
