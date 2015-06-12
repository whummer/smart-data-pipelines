var util = require('util'),
		logger = require('winston'),
		Transform = require('stream').Transform,
		kafka = require('kafka-node'),
		HighLevelProducer = kafka.HighLevelProducer,
		HighLevelConsumer = kafka.HighLevelConsumer;


util.inherits(AnalyticsTransformer, Transform);

/**
 *
 */
function AnalyticsTransformer(name, options) {
	if (!(this instanceof AnalyticsTransformer))
		return new AnalyticsTransformer(options);

	var self = this;

	Transform.call(self, options);
	self.name = name;

	//
	// Init Kafka
	//	
	self.kafkaClient = new kafka.Client("zookeeper.dev.riox.internal:2181");
	self.producer = new HighLevelProducer(self.kafkaClient);
	self.consumer = new HighLevelConsumer(
						self.kafkaClient,
						[
								{ topic: 'proxyTopic1' }
						],
						{
								groupId: 'my-group'
						}
				);		

	self.producer.on('ready', function () {
		logger.info("Kafka producer for %s ready", self.name);

		self.producer.createTopics(['proxyTopic1'], function (err, data) {
			logger.debug("Topic created: ", data);
		});	

		self.consumer.on('message', function (message) {
			logger.debug("Kafka read: ", message);

			logger.debug(message.value);
			self.push("1"); //new Buffer(message.value));
		});

	});

	// kafka error handler
	self.producer.on('error', function (err) {
		logger.error("error: ", err);
	})

}

AnalyticsTransformer.prototype._transform = function(chunk, encoding, done) {

	// logger.info(this.name , ":", chunk.toString('utf8'));

	// write to kafka
	this.producer.send([{ topic : "proxyTopic1" , messages:  chunk.toString(), attributes: 1} ], 
		function (err, data) {
			if (err) {
				logger.error("error:", err);
			}	    	  
			logger.debug("kafka write:", data);
	});

	done();
};

module.exports = AnalyticsTransformer;