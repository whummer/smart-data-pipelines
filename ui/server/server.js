var restify = require('restify');
var mongoose = require('mongoose');
var _ = require('lodash');
var log = global.log = require('winston');
var ModelUtil = global.ModelUtil = require('./model/model_util');

//
// setup loglevel
//
log.remove(log.transports.Console);
log.add(log.transports.Console, {timestamp: true, level: 'debug', colorize: true });

//
// setup mongoose schema
//
mongoose.connect('mongodb://localhost/riox');
global.mongoose = mongoose;
var DataResource = mongoose.model('DataResource',
		{
			name: String,
			description: String,
			price: Number,
			tags : [String],
			connector : {name : String},
			logo: String
		}
);


//
// setup restify server
//
var server = restify.createServer();
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.bodyParser());

// routes
server.get('/resources', loadResources);
server.post('/resources', createResource);
server.get('/resources/:id', loadResource);
server.get('/__init', initDataResourceCollection);


//
//include specialized services
//
global.server = server;
require('./services/user/users_service.js');
require('./services/access/access_service.js');


// fire up instance
server.listen(8080, function () {
	log.info('%s listening at %s', server.name, server.url);
});


//
// setup handlers
//

// load all resources
function loadResources(req, res, next) {
	DataResource.find().exec(function (err, resources) {
		log.debug("Loaded %s resources from mongo", resources.length);
		res.send(resources);
		next();
	});
}

// load a particular resource
function loadResource(req, res, next) {
	var id = req.params.id;
	DataResource.findOne({_id: id}).exec(function(err, resource) {
		if (err) {
			log.error("Could not load resource with ID '%s': %s", id, err);
			next(err);
		}

		log.debug("Loaded resource: %s", resource);
		res.send(resource);
		next();
	})
}

// create a new resource
function createResource(req, res, next) {
	log.info('Incoming request: ', req.body);

	var resource = new DataResource(req.body);
	resource.save(function(err) {
		if (err) {
			log.error("Could not save resource: ", err);
			next(err);
		}

		log.debug("Successfully created new resource: ", req.body.name);
		res.send(resource);
		next();
	});

}


// initialize mongo collection with some sample data
function initDataResourceCollection(req, res, next) {
	DataResource.remove({}).exec(function(err) {
		log.info("Removed all resources from collection");
	});
	var sample = [
		{
			name: 'BMW Connected Drive',
			description: 'Telemetry data about BMW connected cars',
			price: '32',
			tags : ['car', 'speed', 'pressure'],
			logo: 'bmw.png'
		},
		{
			name: 'Mercedes-Benz Commander Data',
			description: 'Telemetry data about Mercedes connected cars',
			price: '34',
			tags : ['car', 'speed', 'temperature'],
			logo: 'mercedes.gif'
		},
		{
			name: 'Toyota X-Connect',
			description: 'Connected car data by Toyota',
			price: '35',
			tags : ['car', 'speed', 'pressure'],
			logo: 'toyota.png'
		},
		{
			name: 'Tesla Everywhere',
			description: 'Connected car data by Tesla',
			price: '48',
			tags : ['car', 'speed', 'temperature'],
			logo: 'tesla.png'
		}
	];

	_.each(sample, function (dataResource) {
		var record = new DataResource({
			name: dataResource.name,
			description: dataResource.description,
			price: dataResource.price,
			tags : dataResource.tags,
			logo: dataResource.logo
		});

		record.save(function () {
			console.log("Successfully saved ", record);
		})
	});

	res.send("ok");

	next();

}
