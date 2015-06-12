var should = require('should'),
	assert = require('assert'),
	kafka = require('kafka-node'),
	HighLevelConsumer = kafka.HighLevelConsumer,
	client = new kafka.Client(),
	Readable = require('stream').Readable;

var KafkaWritableStream = require('../kafka-writeable-stream');

var consumer = new HighLevelConsumer(client, [{ topic: 'topic1', partition: 0 }], { autoCommit: true});

describe('KafkaWritableStream', function () {
	this.timeout(5000)

	it('should write messages to Kafka', function (done) {

		consumer.on('message', function(received) {
			console.log('OnMessage: ', received);
			received.value.should.be.equal(message);
			console.log('Done(): ', done)
			done();
		});


		var kafkaStream = new KafkaWritableStream({topics : ['mirko', 'stinkt']});
		var message = 'hello riox';
		var reader = new Readable;
		reader.push(message);
		reader.push(null);
		reader.pipe(kafkaStream);


	});
});
