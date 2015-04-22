/**
 * Created by omoser on 22/04/15.
 */

var amqp = require('amqp');

exports.createExchange = function(name) {
	var connection = rabbitConnection();
	connection.on('ready', function () {
		connection.exchange(name, {type: 'fanout'}, function (e) {
			console.log('Successfully created exchange: ', e);
			connection.disconnect();
		});
	});
};

exports.bindQueueToExchange = function(queueName, exchangeName) {
	var connection = rabbitConnection();
	connection.on('ready', function () {
		connection.queue(queueName, function (q) {
			console.log('Successfully create new queue: ', q);
			q.bind(exchangeName, '', function() {
				console.log('Successfully bound queue ' + queueName + ' to exchange ' + exchangeName);
				connection.disconnect();
			});
		});
	});
};

function rabbitConnection() {
	return amqp.createConnection({host: global.config.rabbitmq.host, vhost : global.config.rabbitmq.vhost});
}
