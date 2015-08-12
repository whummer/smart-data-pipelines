'use strict';

var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var test = require('../util/testutil');
var starters = require('../util/service.starters');
var fs = require('fs');
var tmp = require('tmp');
var request = require('request');
var crypto = require('crypto');

var app = {};

describe('/files', function() {

	before(function(done) {
		/* start streams service */
		app.files = starters.startFilesService();
		/* get auth token */
		test.authDefault(done);
	});

	after(function() {
		app.files.server.stop();
	});

	var download = function(uri, filename, callback) {
		test.user1.get(uri).
			pipe(fs.createWriteStream(filename)).
			on("close", callback);
	};

	var upload = function(user, filepath, filename, callback) {
		test.user1.
		post(app.files.url + "/upload").
		attach(filename, filepath).
		end(function(err,res) {
			if(err) {
				console.log(err.response.error);
			} else {
				var fileID = res.body.fileID ? res.body.fileID : res.body;
				callback(fileID);
			}
		});
	}

	function checksum (file, algorithm, encoding) {
	    return crypto
	        .createHash(algorithm || 'md5')
	        .update(fs.readFileSync(file), 'utf8')
	        .digest(encoding || 'hex')
	}

	it("uploads and downloads a file", function(done) {
		var tmpName1 = tmp.fileSync().name;
		var tmpName2 = tmp.fileSync().name;
		fs.writeFileSync(tmpName1, "Test file content ...");
		upload(test.user1, tmpName1, "uploaded.txt", function(fileId) {
			download(app.files.url + "/" + fileId, tmpName2, function() {
				assert.equal(checksum(tmpName1), checksum(tmpName2));
				done();
			});
		});
	});

	it('does not allow a non-admin user to access the service', function(done) {
		superagent.post(app.files.url).send({}).end(function(err, res) {
			assert.equal(res.status, status.UNAUTHORIZED);
			done();
		});
	});
});