'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var multer  = require('multer');
var fs  = require('fs');

var HEADER_NAME_ALLOW_ORIGIN = "access-control-allow-origin";
var HEADER_NAME_ORIGIN = "origin";
var HEADER_VALUE_INTERNAL_USE_ONLY = "__internal__";

var directory = exports.directory = "/var/tmp/riox-file-service-data";

var multerUpload = multer({
	dest: directory
	}).single("uploadfile");

exports.upload = multerUpload;

exports.uploadFix = function(req, res, next){
	var result = {files : {}};
	var fileID = req.file.filename;
	result.fileID = fileID;
	res.set("Location", fileID);
	if(req.get(HEADER_NAME_ALLOW_ORIGIN) == HEADER_VALUE_INTERNAL_USE_ONLY) {
		var optionsFile = getMetadataFile(fileID);
		var options = {};
		options[HEADER_NAME_ALLOW_ORIGIN] = HEADER_VALUE_INTERNAL_USE_ONLY;
		fs.writeFileSync(optionsFile, JSON.stringify(options));
	}
    res.json(result);
};

exports.update = multerUpload;

exports.updateFix = function(req, res, next){
	var result = {files : {}};
	var actualFileID = req.params.id;
	var tmpFileID = req.file.filename;
	result.fileID = actualFileID;
	res.set("Location", actualFileID);
	if(req.get(HEADER_NAME_ALLOW_ORIGIN) == HEADER_VALUE_INTERNAL_USE_ONLY) {
		var optionsFile = getMetadataFile(actualFileID);
		var options = {};
		options[HEADER_NAME_ALLOW_ORIGIN] = HEADER_VALUE_INTERNAL_USE_ONLY;
		fs.writeFileSync(optionsFile, JSON.stringify(options));
	}
	/* move/update files */
	var tmpFile = idToFilepath(tmpFileID);
	var actualFile = idToFilepath(actualFileID);
	fs.renameSync(tmpFile, actualFile);

    res.json(result);
};

exports.download = function(req, res, next) {
	var id = req.params.id;
	if(!id) {
		return res.status(404).send();
	}
	var optionsFile = getMetadataFile(id);
	if(fs.existsSync(optionsFile)) {
		var options = JSON.parse(fs.readFileSync(optionsFile));
		if(options[HEADER_NAME_ALLOW_ORIGIN] == HEADER_VALUE_INTERNAL_USE_ONLY) {
			/* file is protected, check authorization */
			if(req.headers[HEADER_NAME_ORIGIN] != HEADER_VALUE_INTERNAL_USE_ONLY) {
				/* We could return 401 here, but this would disclose too much information
				 * to the outside world (think of potential attackers). Let's stay with 404. */
				return res.status(404).send();
			}
		}
	}

	var filename = idToFilepath(id);
	if(fs.existsSync(filename)) {
		fs.createReadStream(filename).pipe(res);
	} else {
		res.status(404).json({});
	}
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

var getMetadataFile = function(fileID) {
	return directory + "/" + fileID + ".metadata";
}
