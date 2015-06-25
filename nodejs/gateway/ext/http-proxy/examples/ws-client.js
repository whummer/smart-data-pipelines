/* 
 * Reads data from our proxy using the websocket protocol.
 */ 

var WebSocket = require('ws'),
    ws = new WebSocket('wss://localhost:8443/mysocket', { rejectUnauthorized: false } );


ws.on('open', function(socket) {
  console.log('open');
  ws.send("hello world");
});

ws.on('message', function(message) {
  console.log('received: %s', message);  
});

ws.on('error', function(message) {
  console.log('error: %s', message);
});