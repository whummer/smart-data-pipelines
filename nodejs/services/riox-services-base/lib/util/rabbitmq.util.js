/**
 * Created by omoser on 22/04/15.
 */

var amqp = require('amqp');

exports.createExchange = function(name, callback) {
	var connection = rabbitConnection();
	connection.on('ready', function () {
		connection.exchange(name, {type: 'fanout'}, function (e) {
			//console.log('Successfully created exchange: ', e);
			connection.disconnect();
			if (callback)
				callback();
		});
	});
};

exports.bindQueueToExchange = function(queueName, exchangeName, callback) {
	var connection = rabbitConnection();
	connection.on('ready', function () {
		connection.queue(queueName, function (q) {
			console.log('Successfully create new queue: ', q.name);
			q.bind(exchangeName, '', function() {
				console.log('Successfully bound queue ' + queueName + ' to exchange ' + exchangeName);
				connection.disconnect();
				if (callback)
					callback();
			});
		});
	});
};

function rabbitConnection() {
	return amqp.createConnection({host: config.rabbitmq.host, vhost : config.rabbitmq.vhost});
}
