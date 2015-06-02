var net = require('net');
var TcpProxy = require('tcp-proxy');

var targets = [
  {
    host: 'localhost',
    port: 1883
  }
];

var proxies = targets.map(function (target) {
  return new TcpProxy({
    target: target
  });
});

var nextProxy = function () {
  var proxy = proxies.shift();
  proxies.push(proxy);
  return proxy;
};

var server = net.createServer(function(socket) {
  nextProxy().proxy(socket, targets[0]);
});

server.listen(8000);