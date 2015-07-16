var
	_ = require('lodash'),
	util = require('util'),
	zlib = require('zlib'),
	Transform = require('stream').Transform,
	uuid = require('uuid'),
	kafka = require('kafka-node'),
	EventEmitter = require('events').EventEmitter,
	HighLevelProducer = kafka.HighLevelProducer,
	log = require('winston');

const
	LOG_FRAME_HEADERS = true,
	TOPIC_CHECK_RETRIES = 10,
	RETRY_DELAY = 100;

log.level = 'debug';

util.inherits(KafkaTransformer, Transform);
module.exports = KafkaTransformer;

function KafkaTransformer(name, context, options) {
	if (!(this instanceof KafkaTransformer))
		return new KafkaTransformer(options);

	this.client = new kafka.Client();
	this.producer = new HighLevelProducer(this.client);
	this.topicsReady = false;
	this.topics = [context.service];
	this.name = name;
	this.context = context;

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

	this.on('topicsReady', function () {
		log.debug('topicsReady: ', self.topicsReady);
	});

	Transform.call(this, options);
}

KafkaTransformer.prototype._transform = function (chunk, encoding, done) {
	log.debug('Context: ', this.context);
	this.parseAndLogFrame(chunk);
	done(null, chunk);
};


// inspired by http://stackoverflow.com/questions/14514657/how-do-you-process-a-basic-websocket-frame
KafkaTransformer.prototype.parseAndLogFrame = function (message) {
	var FIN = (message[0] & 0x80);
	var RSV1 = (message[0] & 0x40);
	var RSV2 = (message[0] & 0x20);
	var RSV3 = (message[0] & 0x10);
	var Opcode = message[0] & 0x0F;
	var mask = (message[1] & 0x80);
	var length = (message[1] & 0x7F);

	if (LOG_FRAME_HEADERS) {
		var frameHeaders = {
			"FIN": FIN,
			"RSV1": RSV1,
			"RSV2": RSV2,
			"RSV3": RSV3,
			"OPCODE": Opcode,
			"MASK": mask,
			"LENGTH": length
		};

		log.debug("FrameHeaders: ", JSON.stringify(frameHeaders));
	}

	var nextByte = 2;
	if (length === 126) {
		// length = next 2 bytes
		nextByte += 2;
	} else if (length === 127) {
		// length = next 8 bytes
		nextByte += 8;
	}

	var maskingKey = null;
	if (mask) {
		maskingKey = message.slice(nextByte, nextByte + 4);
		nextByte += 4;
	}

	var payload = message.slice(nextByte, nextByte + length);

	if (maskingKey) {
		for (var i = 0; i < payload.length; i++) {
			payload[i] = payload[i] ^ maskingKey[i % 4];
		}
	}

	var self = this;
	var compressed = RSV1 == 0x40;
	if (compressed) {
		decompress(payload, FIN, function (err, decompressed) {
			var plainPayload = decompressed.toString();
			log.debug('decompressed: ', plainPayload);
			self.pushToKafka(plainPayload);
		});
	}

};

KafkaTransformer.prototype.pushToKafka = function (chunk) {

	var message = {
		context : this.context,
		payload : new Buffer(chunk).toString("base64")
	};

	var payload = _.map(this.topics, function (topic) {
		return {topic: topic, messages: JSON.stringify(message)};
	});

	log.debug('Kafka payload: ', payload);

	var self = this;
	if (!this.topicsReady) {
		var retries = TOPIC_CHECK_RETRIES;
		var topicsReadyCheck = setInterval(function () {
			if (self.topicsReady) {
				clearInterval(topicsReadyCheck);
				doSend(payload);
			} else {
				if (--retries < 1) {
					log.error('Cannot create topic/never got ready');
					clearInterval(topicsReadyCheck);
				} else {
					log.debug('Topics not ready, retrying');
				}
			}
		}, RETRY_DELAY);
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
		});
	}
};

// inspired by the decompress method in PerMessageDeflate.js from 'ws' node module
function decompress(data, fin, callback) {
	var inflate = zlib.createInflateRaw({
		windowBits: 15
	});

	var buffers = [];

	inflate.on('error', onError).on('data', onData);
	inflate.write(data);
	if (fin) {
		inflate.write(new Buffer([0x00, 0x00, 0xff, 0xff]));
	}

	inflate.flush(function () {
		cleanup();
		callback(null, Buffer.concat(buffers));
	});

	function onError(err) {
		cleanup();
		callback(err);
	}

	function onData(data) {
		buffers.push(data);
	}

	function cleanup() {
		inflate.removeListener('error', onError);
		inflate.removeListener('data', onData);
		if (fin) {
			inflate = null;
		}
	}
}

KafkaTransformer.prototype.createTopic = function (topicId, async) {
	this.producer.createTopics([topicId], async, function (err) {
		if (err) {
			throw new Error('Cannot create new topic: ' + err);
		}
	});
};

KafkaTransformer.prototype.destroyTopic = function (topicId) {
	throw new Error('Not implemented (not available in node-kafka)');
};
