var should = require('should'),
	assert = require('assert'),
	kafka = require('kafka-node'),
	uuid = require('uuid'),
	HighLevelConsumer = kafka.HighLevelConsumer,
	client = new kafka.Client(),
	Readable = require('stream').Readable;

var KafkaWritableStream = require('../kafka-writeable-stream');

var topic1 = uuid.v4();
var topic2 = uuid.v4();


describe('KafkaWritableStream', function () {
	this.timeout(5000);

	it('should write messages to multiple Kafka topics', function (done) {
		var kafkaStream = new KafkaWritableStream({topics : [topic1, topic2]});
		var message = 'hello riox';
		var reader = new Readable;
		reader.push(message);
		reader.push(null);
		reader.pipe(kafkaStream);

		kafkaStream.on('topicsReady', function() {
			var consumer = new HighLevelConsumer(client, [
					{ topic: topic1, partition: 0 },
					{ topic: topic2, partition: 0 }
				],
				{ autoCommit: true});

			var messagesRemaining = 2;
			consumer.on('message', function(received) {
				received.value.should.be.equal(message);
				if (--messagesRemaining == 0) {
					done();
				}
			});

		});
	});
});
