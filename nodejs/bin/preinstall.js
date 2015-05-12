var fs = require('fs');
var resolve = require('path').resolve;
var join = require('path').join;
var cp = require('child_process');
var localConfigFile = (process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']) + "/.rioxrc";
var localConfig = !fs.existsSync(localConfigFile) ? {} : JSON.parse(fs.readFileSync(localConfigFile));

if (localConfig.build) {
  console.log("Using localconfig from " + localConfigFile + ":");
  console.log(">>>>>>>>>>>>>>>>>>>>");
  console.log(JSON.stringify(localConfig, null, 2));
  console.log("<<<<<<<<<<<<<<<<<<<<");
  console.log("\n");
}

var service_directories = ['streams-service', 'users-service', 'riox-services-base', 'analytics-service', 'files-service'];
var services_test_directory = 'services/test';
var web_ui_directory = 'web-ui';

const LINK_DEPS = (localConfig.build && localConfig.build.linklocal) || false;
const USE_LINK_LOCAL = (localConfig.build && localConfig.build.linklocal) || false;
const DO_INSTALL_NPM = false; // disabled in the new testing mode (deps in containers)
const PRUNE_NODE_DIRS = false;

if (USE_LINK_LOCAL) {
	console.log("********************************************************************************");
	console.log("********************************************************************************");
	console.log("                  MAKE SURE YOU HAVE 'linklocal' installed");
	console.log("                 (install it with 'npm install -g linklocal)  ");
	console.log("********************************************************************************");
	console.log("********************************************************************************");
	console.log("");
}

function preinstall_dir(base, dir) {
	var preinstallDirectory = resolve(__dirname, join(base, dir));
	console.log('Preinstalling node modules in ', preinstallDirectory);
	if (!fs.existsSync(join(preinstallDirectory, 'package.json'))) {
		return;
	}

	if(DO_INSTALL_NPM) {
		if (PRUNE_NODE_DIRS) {
			prune_node_directories(preinstallDirectory, function() {
				install_node_modules(preinstallDirectory)
			});
		} else {
			install_node_modules(preinstallDirectory);
		}
	} else {
		// only link local modules
		link_local_modules(preinstallDirectory);
	}
}

function prune_node_directories(preinstallDirectory, callback) {
	console.log("Pruning node_modules directory in ", preinstallDirectory);
	cp.exec('npm prune', {env: process.env, cwd: preinstallDirectory}, function (error, stdout, stderr) {
		if (error) {
			console.log("Cannot prune node modules in directory '" + preinstallDirectory + "': ", error);
			return;
		}

		callback();
	});
}

function install_node_modules(preinstallDirectory) {
	cp.exec('npm install', {env: process.env, cwd: preinstallDirectory}, function (error, stdout, stderr) {
		if (error) {
			console.log("Cannot install node modules in directory '" + preinstallDirectory + "': ", error);
			return;
		}
		console.log('Finished node_modules install in dir: ', preinstallDirectory);
		link_lib_with_linklocal(preinstallDirectory);
	});
}

function link_local_modules(preinstallDirectory) {
	if (LINK_DEPS) {
		if (USE_LINK_LOCAL) {
			link_lib_with_linklocal(preinstallDirectory);
		} else {
			link_lib_with_lodash(preinstallDirectory);
		}
	}
}

function link_lib_with_linklocal(preinstallDirectory) {
	cp.exec('linklocal unlink -r', {env: process.env, cwd: preinstallDirectory}, function(error, stdout, stderr) {		
		if (error) {
			console.log("Cannot linklocal unlink modules in '" + preinstallDirectory + "': ", error);
		}
		cp.exec('linklocal -r', {env: process.env, cwd: preinstallDirectory}, function(error, stdout, stderr) {
			if (error) {
				console.log("Cannot linklocal modules in '" + preinstallDirectory + "': ", error);
			}
		});
	});
}

function link_lib_with_lodash(preinstallDirectory) {
	var nodeModulesDir = join(preinstallDirectory, 'node_modules');
	if (!fs.existsSync(join(nodeModulesDir, "/_"))) {
		console.log("Creating _ link in node_modules directory: ", nodeModulesDir);
		cp.exec('ln -sf ../../lib _', {env: process.env, cwd: nodeModulesDir}, function (error, stdout, stderr) {
			if (error) {
				console.log("Cannot create _ link in " + nodeModulesDir + ": ", stderr);
			}
		});
	}
}

// preinstall web-ui
preinstall_dir('..', web_ui_directory);

// preinstall services test
preinstall_dir('..', services_test_directory);

// preinstall service directories
service_directories.forEach(function (service_dir) {
	preinstall_dir('../services', service_dir);
});
