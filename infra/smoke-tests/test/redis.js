var Redis = require('ioredis');
var should = require('chai').should();
var expect = require('chai').expect;


var client;

describe("Redis smoke tests", function() {

	before(function(done) {

    if (process.env.RIOX_ENV === "development") {
      client = new Redis("redis://redis.development.svc.cluster.local");
    } else {
      client = new Redis({
            sentinels: [{ host: 'redis-sentinel.' + process.env.RIOX_ENV + '.svc.cluster.local',
                          port: 26379 }],
            name: 'mymaster'
      });
    }
	  client.on('connect', function() {
      console.log("Redis connection ready.");
      done();
    });

	});

	describe("transaction", function() {
    // this.timeout(10000);

		it("create", function(done) {

			should.exist(client);

      // console.log("client: ", client);

      client.multi({ pipeline: false });
      client.set('foo', 'bar');
      client.get('foo');
      client.exec(function (err, result) {
        // result === [[null, 'OK'], [null, 'bar']]
        result.should.deep.equals([[null, 'OK'], [null, 'bar']]);
        done();
      });

		});


	});


});
