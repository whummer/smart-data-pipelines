/**
 * Created by omoser on 05/05/15.
 */


angular.module('rioxApp').controller('ConsumerConnectorCtrl', 
function consumerConnectorCtrl($scope, $stateParams) {
	$scope.connectors = [ {
		name : "HTTP Connector",
		type : "http"
	}, {
		name : "AMQP Connector",
		type : "amqp"
	}, {
		name : "JMS Connector",
		type : "jms"
	}, {
		name : "MQTT Connector",
		type : "mqtt"
	}, {
		name : "SMTP Connector",
		type : "smtp"
	}, {
		name : "TCP Connector",
		type : "tcp"
	} ];

	$scope.checkIfSourceSelected($stateParams); // call to parent controller
});
