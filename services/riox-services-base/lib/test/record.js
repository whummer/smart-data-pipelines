var nock = require('nock');
var path = require('path');
var fs = require('fs');

// Recording test fixtures.
// See here for more details
// https://orchestrate.io/blog/2014/06/13/how-to-test-code-that-uses-http-apis-using-node-js-mocha-and-nock/
module.exports = function (name, options) {
	// options tell us where to store our fixtures
	options = options || {};
	// var test_folder = options.test_folder || 'test';
	var fixtures_folder = options.fixtures || 'fixtures';
	var fp = path.join(fixtures_folder, name + '.js');

	// `has_fixtures` indicates whether the test has fixtures we should read,
	// or doesn't, so we should record and save them.
	// the environment variable `NOCK_RECORD` can be used to force a new recording.
	var has_fixtures = !!process.env.NOCK_RECORD;

	return {
		// starts recording, or ensure the fixtures exist
		before: function () {
			if (!has_fixtures) {
				try {
						require(fp);
						has_fixtures = true;
				 } catch (e) {
						nock.recorder.rec({
							dont_print: true
						});
				}
			} else {
				// console.log("before record: need to record");
				has_fixtures = false;
				nock.recorder.rec({
					dont_print: true
				});
			}
		},
		// saves our recording if fixtures didn't already exist
		after: function (done) {
			if (!has_fixtures) {
				var fixtures = nock.recorder.play();
				var text = "var nock = require('nock');\n" + fixtures.join('\n');
				fs.writeFile(fp, text, done);
			} else {
				done();
			}
		}
	}
};
