
var gulp = require('gulp');
var cp = require('child_process');


global.runCmd = function(cmd, args, cwd, env) {
	var _cwd = cwd || __dirname;
	console.log(cmd, args, _cwd);
	return cp.spawn(cmd, args,
			{env: env || process.env, cwd: _cwd, stdio: 'inherit'})
}

var installBower = function(demoName) {
	runCmd("bower", ["install"], __dirname + "/" + demoName);
};

var runCmd = function(cmd, args, cwd, env) {
	var _cwd = cwd || __dirname;
	return cp.spawn(cmd, args,
			{env: env || process.env, cwd: _cwd, stdio: 'inherit'})
};

/* run service using nodemon */
gulp.task('demo:stadtwerke:serve', function () {
	installBower("stadtwerke");
	runCmd("nodemon", ["server.js"], __dirname + "/stadtwerke");
});
/* run service using plain node */
gulp.task('demo:stadtwerke:run', function () {
	installBower("stadtwerke");
	runCmd("node", ["server.js"], __dirname + "/stadtwerke");
});
