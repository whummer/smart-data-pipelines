'use strict';

var log = global.log || require('winston');
var should = require('chai').should();


describe("source::script", function() {

	it('generates a custom script tag', function(done) {
		var args = {
			dryrun: true,
			next_id: "target",
			previous_id: "source",
			options: {
				location : "myscript.groovy",
				variables : {
					"key1" : "value1",
					"key2" : "value2"
				}
			},
		};

		var modulz = require('../../api/pipes/deployments/mapping/springxd/processor/script');
		modulz(args).then(stream => {
			stream.should.equal("queue:source > script --script=myscript.groovy --variables='key1=value1,key2=value2' > queue:target")
			done();
		})
		.catch( err => {
			log.error(err);
			should.fail();
		});
	});
});
