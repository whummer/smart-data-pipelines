/**
 * Created by omoser on 05/05/15.
 */


var consumerConnectorCtrl = function consumerConnectorCtrl($scope) {
  $scope.connectors = [
    {name: "HTTP Connector", type: "http"},
    {name: "AMQP Connector", type: "amqp"},
    {name: "JMS Connector", type: "jms"},
    {name: "MQTT Connector", type: "mqtt"},
    {name: "SMTP Connector", type: "smtp"},
    {name: "TCP Connector", type: "tcp"}
  ];
}

angular.module('rioxApp').controller('consumerConnectorCtrl', consumerConnectorCtrl);
