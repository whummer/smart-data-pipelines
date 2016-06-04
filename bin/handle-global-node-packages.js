var resolve = require('path').resolve;

// CHDIR
process.chdir(resolve(__dirname + '/..'))

var npm = require("npm");
var fs = require('fs');
var cp = require('child_process');
var semver = require('./semver');
var merge = require('merge');

//
// the directories where package.json's are looked up
//
var nodeDirs = [".", "services/test", 
	"services/users-service", "services/pipes-service", "services/analytics-service",
	"services/files-service", "services/gateway-service", "services/access-service", 
	"services/pricing-service", "services/riox-services-base", "web-ui"];

//
// handle cmdline args
//
var pretend = false;
var verbose = false;
var uninstall = false;

process.argv.forEach(function (val, index, array) {
	switch (val) {
		case '--pretend':
			console.log('Running in pretend mode');
			pretend = true;
			break;

		case '--verbose':
			console.log('Running in verbose mode');
			verbose = true;
			break;

		case '--uninstall':
			console.log('Running in uninstall mode');
			uninstall = true;
			break;

		default:
			break;
	}
});


//
// first find all globally installed packages
//
var installDepsGlobally = function() {
	var globallyInstalled = {};
	npm.load({global: true, parseable: true, long: false}, function (err) {
		if (err) {
			console.log("cannot load NPM: ", err);
			return;
		}

		npm.commands.ls([], true, function (err, data) {
			if (err) {
				console.log("Cannot list globally install packages");
				return;
			}

			Object.keys(data.dependencies).forEach(function (dep) {
				var version = data.dependencies[dep].version;
				if (verbose) {
					console.log("Name: >>> " + dep + " >>> Version: " + version);
				}

				globallyInstalled[dep] = version;
			});

			//
			// then install all packages from the package.json's in nodedirs if they are not yet
			// installed globally
			//
			installGlobalIfNotExists(globallyInstalled);
		});
	});
};


var findDuplicateDeps = function() {
	var deps = {};
	nodeDirs.forEach(function (dir) {
		deps[dir] = JSON.parse(fs.readFileSync(dir + "/package.json"));
	});
	nodeDirs.forEach(function (dir1) {
		var deps1 = deps[dir1];
		nodeDirs.forEach(function (dir2) {
			var deps2 = deps[dir2];
			if(dir1 != dir2) {
				allDeps1 = merge.recursive(true, deps1.dependencies, deps1.devDependencies)
				for (var d1 in allDeps1) {
					allDeps2 = merge.recursive(true, deps2.dependencies, deps2.devDependencies)
					for (var d2 in allDeps2) {
						var v1 = allDeps1[d1];
						var v2 = allDeps2[d2];
						if(d1 == d2 && ! localModule(v1)) {
							console.log("WARN: Found duplicate dependency '" + d1 + "' in " + [dir1, dir2]);
							if(v1 != v2) {
								console.log(" -> version is also different: " + [v1, v2])
							}
						}
					}
				}
			}
		});
	});
};

var installDepsLocally = function() {
	var cmd = "npm install && linklocal";
	nodeDirs.forEach(function (dir) {
		console.log("Installing node modules in directory", dir);
		var proc = cp.execSync(cmd, {cwd: dir, env: process.env}, function (error, stdout, stderr) {
			if (error) {
				console.log("Cannot install node modules in directory: ", dir, error);
			}
		});
	});
};

//
// HELPERS
//

function localModule(version) {
	return version.indexOf("./") >= 0;
}

function getCleanVersion(version) {
	var cleanVersion = version;
	if (!version.match(/^\d/)) {
		cleanVersion = version.substring(1);
	}

	return cleanVersion;
}

function handleDeps(dependencies, deps, installed, isDev) {
	for (var dep in dependencies) {
		var version = dependencies[dep];
		if (localModule(version)) {
			if (verbose) {
				console.log("Skipping local module " + dep);
			}

			continue;
		}

		var cleanVersion = getCleanVersion(version);//semver.clean(version);//
		if (verbose) {
			console.log("Dep: " + dep + ", Version: " + cleanVersion + " Installed: " + installed[dep]);
		}

		var versionsValid = semver.valid(cleanVersion) && semver.valid(installed[dep]);

		if (!uninstall && (installed[dep] == cleanVersion || (versionsValid && semver.gt(installed[dep], cleanVersion)))) {
			console.log("Skipping already installed dependency: " + dep + " (" + cleanVersion + ")");
		} else {
			if (verbose) {
				console.log("Adding " + (isDev ? "(DEV)" : "") + " dependency: " + dep + " (" + cleanVersion + ")");
			}

			addDepToHash(deps, dep, version);
		}
	}
}

function installGlobalIfNotExists(installed) {
	var deps = {};
	nodeDirs.forEach(function (dir) {
		var f = JSON.parse(fs.readFileSync(dir + "/package.json"));
		handleDeps(f.dependencies, deps, installed, false);
		handleDeps(f.devDependencies, deps, installed, true);
	});

	var str = "sudo npm --ignore-scripts " + (uninstall ? "uninstall" : "install") + " -g  ";
	for (var key in deps) {

		// don't remove gulp in any case
		if (uninstall && key == 'gulp') {
			continue;
		}

		str += " " + key;
		if (!uninstall) {
			str += "@" + deps[key];
		}
	}

	console.log("Running command:", str);

	if (!pretend) {
		cp.exec(str, {env: process.env}, function (error, stdout, stderr) {
			if (error) {
				console.log("Cannot install node modules.", error);
			}
		});
	}
}

function addDepToHash(deps, dep, version) {
	if (localModule(version)) {
		/* local module path -> ignore! */
		//console.log("INFO: Ignoring local module dependency '" + dep + "' with path '" + version + "'");
		return;
	}

	if (deps[dep] && deps[dep] != version) {
		console.log("WARN: Overwriting version of '" + dep + "' from '" +
		deps[dep] + "' to '" + version + "'");
	}

	deps[dep] = version;
}

findDuplicateDeps();
//installDepsGlobally();
installDepsLocally();
