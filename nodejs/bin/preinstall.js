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
	// get library path
	var lib = resolve(__dirname, join(base, dir));

	fs.readdirSync(lib)
			.forEach(function (mod) {
				var modPath = join(lib, mod)

				console.log('Preinstalling node modules in ', modPath);


				// ensure path has package.json
				if (!fs.existsSync(join(modPath, 'package.json'))) {
					return;
				}


				// install folder
				cp.spawn('npm', ['i'], {env: process.env, cwd: modPath, stdio: 'inherit'})
			})
}

// preinstall web-ui
preinstall_dir('..', web_ui_directory);

// preinstall service directories
_.forEach(service_directories, function(service_dir) {
	preinstall_dir('../services', service_dir);
});