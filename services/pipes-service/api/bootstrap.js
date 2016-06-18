'use strict';

var PipeElement = require('./pipeelements/pipeelement.model.js').Model;
var Pipe = require('./pipes/pipe.model.js').Model;
var log = global.log || require('winston');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var Client = require('node-rest-client').Client;

var sources = [
	{
		name: 'HTTP Outbound',
		category: 'source',
		type: 'http-out',
		description: 'An outbound polling HTTP source',
		icon: 'globe',
		options: [
			{name: 'name', type: 'String'},
			{name: 'url', type: 'String'},
			{name: 'method', type: 'String'},
			{name: 'interval', type: 'Number'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/source.http-out.html")
	},
	{
		name: 'HTTP Inbound',
		category: 'source',
		type: 'http-in',
		description: 'An inbound HTTP source that you can push messages to.',
		icon: 'globe fa-spin',
		options: [
			{name: 'port', type: 'String'},
			{name: 'path', type: 'String'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/source.http-in.html")
	},
	{
		name: 'Websocket In',
		category: 'source',
		type: 'websocket-in',
		description: 'An inbound Websocket source that you can push messages to.',
		icon: 'globe fa-spin',
		options: [
			{name: 'port', type: 'Integer'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/source.websocket.html")
	},
	{
		name: 'Twitter Stream',
		category: 'source',
		type: 'twitter-stream',
		description: 'A Twitter stream that processes tweets as input messages.',
		icon: 'twitter',
		options: [
			{name: 'follow', type: 'String'},
			{name: 'track', type: 'String'}
		]
	}
];

var processors = [
	{
	 	name: 'Transform',
	 	category: 'processor',
	 	type: 'transform',
		description: 'A processor used to transform message payloads.',
	 	icon: 'gears',
	 	options: [],
		html: fs.readFileSync(__dirname + "/bootstrap/processor.transform.html")
	},
	{
		name: 'Script',
		category: 'processor',
		type: 'script',
		description: 'A processor used to run scripts against message payloads.',
		icon: 'code',
		options: [
			{name: 'name', type: 'String', description: 'User-defined name of this element'},
			{name: 'location', type: 'String', description: 'location of script file (e.g. URL)'},
			{name: 'sync-interval', type: 'Number', description: 'seconds between refresh from script location'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/processor.script.html")
	},
	{
		name: 'Enricher (CSV)',
		category: 'processor',
		type: 'enrich',
		description: 'A processor for enriching message payloads with static data from a CSV file.',
		icon: 'enricher-csv',
		options: [
			{name: 'name', type: 'String', description: 'User-defined name of this element'},
			{name: 'url', type: 'String', description : 'URL of the data to fetch for enriching.'},
			{name: 'cache', type: 'Integer', description : 'Number of seconds to cache data, or -1 to cache indefinitely. Default: -1'},
			{name: 'overwrite', type: 'String', description : 'Wether to overwrite existing fields in the target document. If false, prefix field names with \'_\' to avoid collision. Default: false'},
			{name: 'flat', type: 'String', description : 'Whether to put the CSV data top-level into the document (CSV columns become top-level document fields). If false, puts the CSV result into a new field. Default: true'},
			{name: 'columns', type: 'String', description : 'Comma-separated list of column names. If empty, first row of CSV is used as column names. Default: null'},
			{name: 'sourceID', type: 'String', description : 'Name of the discriminator field on the source (e.g., column name of CSV file).'},
			{name: 'targetID', type: 'String', description : 'Name of the discriminator field on the target (e.g., field name of downstream JSON message).'},
			{name: 'mappings', type: 'String', description : 'Comma-separated list of explicit ID mappings/alias in the form \'<string>:<string>\'. E.g., \'id1:ID1,id2:ID2\''}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/processor.enrich.html")
	},
	{
		name: 'Timeseries',
		category: 'processor',
		type: 'timeseries',
		description: 'A timeseries prediction processor.',
		icon: 'timeseries',
		options: [
			{name: 'interval', type: 'String', description : 'Prediction interval, e.g., "3" -> 3 items into the future. Default: "1"'},
			{name: 'field', type: 'String', description : 'The payload field used for prediction. By default, all numeric payload fields are forecast.'},
			{name: 'min', type: 'Double', description : 'Minimum value to apply. Prevents the forecast to get out of range (e.g., negative values).'},
			{name: 'type', type: 'Enum', description : '{GAUSSIAN_PROCESSES, LINEAR_REGRESSION}'}
		]
	},
	{
		name: 'Splitter',
		category: 'processor',
		type: 'split',
		description: 'A message splitter used to split up single messages into arrays of messages.',
		icon: 'share-alt',
		options: [
			{name: 'mapping', type: 'String', description : 'Mapping for splitting up documents. E.g., "id.*:id:value" turns {id1:v2,id2:v2} into [{id:id1,value:v1},{id:id2,value:v2}]'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/processor.split.html")
	},
];

var sinks = [
	{
		name: 'Map Visualization',
		category: 'sink',
		type: 'geo-map',
		description: 'A sink module used to visualize data on a map.',
		icon: 'map-o',
		options: [
			{'name': 'index', type: 'String', description: 'ElasticSearch index name'},
			{'name': 'typeName', type: 'String', description: 'ElasticSearch type name'},
			{'name': 'idField', type: 'String', description: 'Name of the ID in ElasticSearch'},
			{'name': 'locField', type: 'String', description: 'Location field in ElasticSearch'},
			{'name': 'labelTemplate', type: 'String', description: 'Label template for map markers. Example: <div>{{name}}</div>'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/sink.geo-map.html")
	},

	{
		name: 'Chart Visualization',
		category: 'sink',
		type: 'chart',
		description: 'A sink module used to visualize data on a line chart.',
		icon: 'chart',
		options: [
			{'name': 'index', type: 'String', description: 'ElasticSearch index name'},
			{'name': 'typeName', type: 'String', description: 'ElasticSearch type name'},
			{'name': 'search', type: 'String', description: 'ElasticSearch search terms (array)'},
			{'name': 'titles', type: 'String', description: 'Chart titles (array)'},
			{'name': 'valueField', type: 'String', description: 'Value fields'},
			{'name': 'timeField', type: 'String', description: 'Name of time field, for timeseries'},
			{'name': 'labelTemplate', type: 'String', description: 'Template for the chart labels'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/sink.chart.html")
	},

	{
		name: 'Table Visualization',
		category: 'sink',
		type: 'table',
		description: 'A sink module used to visualize data in tabular form.',
		icon: 'table',
		options: [
			{'name': 'index', type: 'String', description: 'ElasticSearch index name'},
			{'name': 'type', type: 'String', description: 'ElasticSearch type name'},
			{'name': 'id-field', type: 'String', description: 'Name of the ID in ElasticSearch'},
			{'name': 'columns', type: 'Map', description: 'Key/value pairs for table columns'}
		]
	},

	{
		name: 'Elasticsearch',
		category: 'sink',
		type: 'elasticsearch',
		description: 'A sink module used to store data in Elasticsearch.',
		icon: 'globe fa-spin',
		options: [
			{'name': 'index', type: 'String', description: 'ElasticSearch index name'},
			{'name': 'typeName', type: 'String', description: 'ElasticSearch type name'},
			{'name': 'host', type: 'String', description: 'ElasticSearch host'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/sink.elasticsearch.html")
	},

	{
		name: 'Websocket Out',
		category: 'sink',
		type: 'websocket-out',
		description: 'A sink module used to expose messages via a Websocket connection.',
		icon: 'globe fa-spin',
		options: [
			{name: 'port', type: 'Integer'}
		],
		html: fs.readFileSync(__dirname + "/bootstrap/sink.websocket.html")
	},

	{
		name: 'Log',
		category: 'sink',
		type: 'log',
		description: 'A sink module used to log messages (for debugging).',
		icon: 'file-text-o',
		options: [
		],
		html: fs.readFileSync(__dirname + "/bootstrap/sink.log.html")
	}
];

module.exports.insertDefaultElements = function () {

	/* add the default sources, processors and sinks. first check if element already exists. */

	/* Whether to update/overwrite existing pipe elements when the pipes-service (re-)starts. 
	 * NOTE: This is required for staging rollout, where we deploy new code releases: Besides changing 
	 * the code, we also need to update the information in the database, if there are any changes.
	 * NOTE: This implies that we do not allow to change the pipe elements manually in the database,
	 * but I guess we discussed that we DO NOT want to support that for now anyways. Updates to the
	 * pipe elements should always be merged in via test-staging-production rollout. */
	var updateExistingPipeElements = true;

	[sources, sinks, processors].forEach(elements => {
		elements.forEach(element => {
			PipeElement.findQ({type: element[TYPE]}).then(result => {
				if (!result || result.length == 0) {
					var pipeElement = new PipeElement(element);
					pipeElement.saveQ().then(saved => {
						log.debug('Saved %s "%s" with ID %s', saved[CATEGORY], saved[TYPE], saved._id);
					}).catch(error => {
						log.error('Cannot save element "%s": %s', element[TYPE], error);
					});
				} else {
					log.info('Element "%s" already exists in DB. Updating the info.', element[TYPE]);
					if(result.length != 0) {
						result = result[0];
					}
					if(updateExistingPipeElements) {
						for(var key in element) {
							result[key] = element[key];
						}
						result.saveQ().then(saved => {
							/* successfully updated. */
						}).catch(error => {
							log.error('Cannot update element "%s": %s', element[TYPE], error);
						});
					}
				}
			})
		})
	});

	/* add the sample data pipes from the examples directory if they do not exist */

	const dir = __dirname + '/../examples';
	fs.readdirAsync(dir).map(filename => {
		var file = dir + '/' + filename;
		return fs.readFileAsync(file, "utf8")
			.then(JSON.parse)
			.then(pipeDef => {

				Pipe.findQ({'_id' : pipeDef.id}).then(result => {
					if (!result || result.length ==0) {
						var pipe = new Pipe(pipeDef);
						pipe._id = pipe.id = pipeDef.id;
						pipe.saveQ().then(saved => {
							log.info('Successfully saved sample pipe ', saved.name);
						}).catch(error => {
							log.error('Cannot save pipe %s:', pipeDef.name, error, pipeDef);
						});
					} else {
						log.info('Sample pipe "%s" already exists', pipeDef.name);
					}
				})
			})
			.catch(SyntaxError, e => {
				log.error("Invalid json in file: ", e);
			})
			.catch(e => {
				log.error("Unable to read file: ", e);
			});
	});

};
