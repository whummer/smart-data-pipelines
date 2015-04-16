/**
 *  Visit every component and runs npm install.
 *  See: https://strongloop.com/strongblog/modular-node-js-express/
 */

var fs = require('fs');
var resolve = require('path').resolve;
var join = require('path').join;
var cp = require('child_process');
var _ = require('lodash');

var service_directories = ['streams-service', 'users-service'];
var web_ui_directory = 'web-ui';

console.log("Preinstalling node modules");

function preinstall_dir(base, dir) {
	var preinstallDirectory = resolve(__dirname, join(base, dir));
	console.log('Preinstalling node modules in ', preinstallDirectory);
	// ensure path has package.json

	if (!fs.existsSync(join(preinstallDirectory, 'package.json'))) {
		return;
	}

	// install folder
	cp.spawn('npm', ['i'], {env: process.env, cwd: preinstallDirectory, stdio: 'inherit'})
}


// preinstall web-ui
preinstall_dir('..', web_ui_directory);

// preinstall service directories
_.forEach(service_directories, function (service_dir) {
	preinstall_dir('../services', service_dir);
});