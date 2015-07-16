var mosca = require('mosca'),
	appConfig = require('riox-services-base/lib/config/services');


var ascoltatore = {
	//using ascoltatore
	type: 'mongo',				
	url: appConfig.infra.mongodb.baseurl + '/mqtt',
	pubsubCollection: 'ascoltatori',
	mongo: {}
};

var moscaSettings = {
	port: 1883,
	backend: ascoltatore,
	persistence: {
		factory: mosca.persistence.Mongo,
		url: appConfig.infra.mongodb.baseurl + '/mqtt',
	}
};

var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client) {
	console.log('client connected', client.id);		 
});

// fired when a message is received
server.on('published', function(packet, client) {
	console.log('Published', packet.payload);
});

// fired when the mqtt server is ready
function setup() {
	console.log('Mosca server is up and running')
}