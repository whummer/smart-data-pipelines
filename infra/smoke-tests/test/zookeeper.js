var zk = require('node-zookeeper-client');
var should = require('chai').should();
var expect = require('chai').expect;

var client = zk.createClient('zookeeper.' + process.env.RIOX_ENV + '.svc.cluster.local:2181');

describe("Zookeeper smoke tests", function() {

	before(function(done) {
		client.connect();
		client.on('connected', function () {
			// console.log('Client state is changed to connected.');
			done();
		});
	});

	after(function(done) {
		if (client) {
			client.close();
			done();
    }
	});

	describe("node", function() {

		it("creates a node", function(done) {
			should.exist(client);

			client.mkdirp('/test/demo/1/2/3', function (error, path) {
					if (error) {
							console.log(error.stack);
							throw error;
					}
					expect(path).to.equal('/test/demo/1/2/3');
					done();
			});

		});

		it("checks whether it exists", function(done) {
			should.exist(client);
			client.exists('/test/demo/1/2/3', function (error, stat) {
				should.exist(stat);
				should.not.exist(error);
				done();
			});
		});

	});


});
