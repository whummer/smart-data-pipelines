var ws = require('websocket.io'), 
		util = require('util'),
		server = ws.listen(9014, function() {
			console.log("Server running on port 9014");
		});
 
server.on('connection', function (socket) {

	// send data
	setInterval(function() {
		socket.send(new Buffer(util.format('{  "random" : %d }', randomInt(0, 100))));
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