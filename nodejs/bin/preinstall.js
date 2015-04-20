var fs = require('fs');
var resolve = require('path').resolve;
var join = require('path').join;
var cp = require('child_process');
var _ = require('lodash');

var service_directories = ['streams-service', 'users-service'];
var services_directory = 'services';
var web_ui_directory = 'web-ui';

function preinstall_dir(base, dir) {
	var preinstallDirectory = resolve(__dirname, join(base, dir));
	console.log('Preinstalling node modules in ', preinstallDirectory);
	if (!fs.existsSync(join(preinstallDirectory, 'package.json'))) {
		return;
	}

	cp.exec('npm i', {env: process.env, cwd: preinstallDirectory}, function (error, stdout, stderr) {
		console.log('Finished node_modules install in dir: ', preinstallDirectory);
		var nodeModulesDir = join(preinstallDirectory, 'node_modules');
		if (!fs.existsSync(join(nodeModulesDir, "/_"))) {
			console.log("Creating _ link in node_modules directory: ", nodeModulesDir);
			cp.exec('ln -sf ../../lib _', {env: process.env, cwd: nodeModulesDir}, function (error, stdout, stderr) {
				if (error) {
					console.log("Cannot create _ link in " + nodeModulesDir + ": ", stderr);
				}
			});
		}
	});
}

// preinstall web-ui
preinstall_dir('..', web_ui_directory);

//preinstall services
preinstall_dir('..', services_directory, '../lib');

// preinstall service directories
//_.forEach(service_directories, function (service_dir) {
//	preinstall_dir('../services', service_dir);
//});
