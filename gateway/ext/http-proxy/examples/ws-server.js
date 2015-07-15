var ws = require('websocket.io'), 
		util = require('util');


var port = process.argv[2] || 5000;

var server = ws.listen(port, function() {
			console.log("Websocket server running on port", port);
});
 
server.on('connection', function (socket) {

	// send data
	setInterval(function() {
		socket.send(util.format('{  "random" : %d }', randomInt(0, 100)));
	}, 5000);


	socket.on('message', function (msg) { 
		console.log("received msg", msg);
	});

	socket.on('close', function () { 
		console.log("Socket disconnected");
	});

});

server.on('upgrade', function (req, socket, head) {
	console.log("upgrade: ", req);
	server.handleUpgrade(req, socket, head);
});

// random integer [low, high] (both inclusive)
function randomInt(low, high) {
		return Math.floor(Math.random() * (high - low + 1) + low);
}