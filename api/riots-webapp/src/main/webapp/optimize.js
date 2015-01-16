/**
 * @author whummer
 *
 * Util script for packaging bower dependencies into a single 
 * optimized JavaScript file. Default location for the final file is
 * app/scripts/build/r.js . This file will be overwritten each time.
 *
 * To run this file, first install node dependencies:
 *   npm install -g -S 'jquery@>=2.1'
 *   npm install -g -S 'jsdom@latest'
 * Then execute the file:
 *   node optimize.js
 * 
 */


var env = require("jsdom").env;

env("", function (errors, window) {

	var appDir = "./app";

    var $ = require("jquery")(window);
	requirejs = require(appDir + "/scripts/build/r.js");

	var fs = require("fs");
	eval(fs.readFileSync(appDir + "/config.js")+"");
	appConfig.bowerRootPath = "./bower_components/";
	appConfig.appRootPath = "./app/";
	eval(fs.readFileSync(appDir + "/config.requirejs.js")+"");

	var cfg = JSON.parse(JSON.stringify(requirejsAppConfig));

	// build config includes
	cfg.include = [
		"riots/auth",
		"riots/charting",
		"riots/maps-markers",
		"riots/imports",
		"riots/ratings",
		"riots/service-calls",
		"riots/things-crud",
		"riots/utils",
		"riots/widgets-angularui"
	];
	function addDependency(dep) {
		if($.inArray(dep, cfg.include) < 0) {
			cfg.include.push(dep);
		}
	}

	$.each(requirejsAppConfig.paths, function(idx,el) {
		addDependency(idx);
	});
	$.each(requirejsAppConfig.packages, function(idx,el) {
		if(el.main && !el.excludeFromOptimize) {
			addDependency(el.name);
		}
	});

	$.each(cfg.include, function(idx,el) {
		console.log("include dependency '" + el + "'");
	});

	cfg.exclude = [];
	
    cfg.baseUrl = ".";
   	delete cfg.name;
    cfg.out = appDir + "/scripts/build/riots-all.js";
    cfg.waitSeconds = 7;
	cfg.findNestedDependencies = true;
	cfg.wrapShim = true;
	cfg.optimize = "none";
	cfg.optimize = "uglify2";
	cfg.uglify = cfg.uglify2 = {
		//mangle : false
	}

	requirejs.optimize(cfg, function (buildText) {
		console.log("build info:", buildText);
	}, function (error) {
		console.error("requirejs.optimize error", error);
	});

});