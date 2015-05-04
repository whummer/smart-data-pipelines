'use strict';

var passport = require('passport');
var jwt = require('jsonwebtoken');
var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var multer  = require('multer');
var fs  = require('fs');

var directory = exports.directory = "/var/tmp/riots-file-service-data";

exports.upload = multer(
		{ dest: directory }
);

exports.uploadFix = function(req, res, next){
	var result = {files : {}};
	var fileID = null;
	var keys = Object.keys(req.files);
	keys.forEach(function(key) {
		var val = req.files[key];
		fileID = val.name;
		result.files[key] = fileID;
	});
	result.fileID = fileID;
	res.set("Location", fileID);
	if(keys.length == 1) {
		result = fileID;	
	}
    res.json(result);
};

exports.create = function(req, res, next) {
	// TODO
};

exports.download = function(req, res, next) {
	var id = req.params.id;
	if(!id) {
		return next(404);
	}
	var filename = idToFilepath(id);
	var pipe = fs.createReadStream(filename).pipe(res);
};

exports.remove = function(req, res, next) {
	var id = req.params.id;
	if(!id) {
		return next(404);
	}
	var filename = idToFilepath(id);
	res.pipe(fs.createReadStream(filename));
};

var idToFilepath = function(id) {
	return directory + "/" + id;
};
