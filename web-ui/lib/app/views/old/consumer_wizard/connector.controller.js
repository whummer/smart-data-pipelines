/**
 * Created by omoser on 05/05/15.
 */


var consumerConnectorCtrl = function consumerConnectorCtrl($scope) {
	$scope.connectors = [
		{name: "Websocket Connector", type: "ws"},
		{name: "TCP Connector", type: "tcp"},
		{name: "AMQP Connector", type: "amqp"},
		{name: "JMS Connector", type: "jms"},
		{name: "MQTT Connector", type: "mqtt"},
		{name: "SMTP Connector", type: "smtp"}

	];
}

angular.module('rioxApp').controller('ConsumerConnectorCtrl', consumerConnectorCtrl);
