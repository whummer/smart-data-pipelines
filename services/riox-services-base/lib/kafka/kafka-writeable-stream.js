var _ = require('lodash'),
	util = require('util'),
	uuid = require('uuid'),
	kafka = require('kafka-node'),
	EventEmitter = require('events').EventEmitter,
	WritableStream = require('stream').Writable,
	HighLevelProducer = kafka.HighLevelProducer,
	log = require('winston');

log.level = 'debug';

var KafkaWritableStream = function (options) {
	options = options || {};
	this.topics = options.topics || generateTopicId();
	this.client = new kafka.Client();
	this.producer = new HighLevelProducer(this.client);
	this.topicsReady = false;

	var self = this;
	this.producer.on('ready', function () {
		self.producer.createTopics(self.topics, false, function (err) {
			if (err) {
				throw new Error('Cannot create new topic: ' + err);
			}

			self.topicsReady = true;
			self.emit('topicsReady');
		});
	});


	WritableStream.call(this);
};

util.inherits(KafkaWritableStream, WritableStream);

KafkaWritableStream.prototype._write = function (chunk, encoding, done) {
	log.debug('Got chunk: ', chunk.toString());
	var payload = _.map(this.topics, function (topic) {
		return {topic: topic, messages: chunk.toString()};
	});

	var self = this;

	if (!this.topicsReady) {
		var topicsReadyCheck = setInterval(function () {
			if (self.topicsReady) {
				clearInterval(topicsReadyCheck);
				doSend(payload);
			} else {
				log.debug('Topics not ready, retrying');
			}
		}, 100)
	} else {
		doSend(payload);
	}


	function doSend(payload) {
		self.producer.send(payload, function (err, data) {
			if (err) {
				log.error('Cannot send chunk: ', err);
				throw new Error('Cannot send chunk: ' + err);
			}

			log.debug('Successfully pushed chunk to kafka: ', data);
			if (done) {
				done();
			}
		});
	}
};

KafkaWritableStream.prototype.createTopic = function (topicId, async) {
	this.producer.createTopics([topicId], async, function (err) {
		if (err) {
			throw new Error('Cannot create new topic: ' + err);
		}
	});
};

KafkaWritableStream.prototype.destroyTopic = function (topicId) {
	throw new Error('Not implemented (not available in node-kafka)');
};

function generateTopicId() {
	return [uuid.v4()];

}

module.exports = KafkaWritableStream;
