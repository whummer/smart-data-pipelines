'use strict';

var Pipe = require('./pipe.model.js').Model;
var	errors = require('riox-services-base/lib/util/errors');
var	auth = require('riox-services-base/lib/auth/auth.service');
var	log = global.log;
var uuid = require('node-uuid');

var PREDEFINED_NODERED_KEYS = ["id", "type", "x","y","z", "wires"];

exports.listAll = function (req, res, next) {
	Pipe.findQ({}).then(pipes => {
		if (!pipes || pipes.length == 0) {
			return next(errors.NotFoundError('No pipes found'));
		}

		log.info(`Loaded ${pipes.length} pipes`);
		return res.json(200, pipes);
	}).catch(error => {
		log.error(`Cannot list pipes: ${error}`);
		return next(errors.InternalError('Cannot list pipes', error));
	});
};

exports.findById = function (req, res, next) {
	var pipeId = req.params.id;
	log.debug('Finding pipe by id %s', pipeId);
	Pipe.findByIdQ(pipeId).then(pipe => {
		if(!pipe) {
			return res.status(404).json({ error: "No pipe found for ID " + pipeId });
		}
		return res.json(200, pipe);
	}).catch(error => {
		log.error('Cannot load pipe by ID "%s": ', error);
		return next(errors.NotFoundError('No such pipe: ', pipeId));
	});
};

exports.create = function (req, res, next) {
	var pipeDef = req.body;
	var pipe = new Pipe(pipeDef);
	var user = auth.getCurrentUser(req);
	pipe[CREATOR_ID] = user[ID];

	//exports.addUUIDs(pipe);

	pipe.saveQ().then(savedPipe => {
		log.info(`Saved pipe with ID: ${savedPipe._id}`);
		res.setHeader('Location', `${req.getUrl()}/${savedPipe._id}`);
		return res.json(201, {'id': savedPipe.id});
	}).catch(error => {
		return validationError(error, next);
	});
};

exports.update = function (req, res, next) {
	var pipeId = req.params.id;
	var pipeDef = req.body;
	log.debug(`Updating pipe "${pipeId}": ${pipeDef}`);
	Pipe.findByIdAndUpdateQ(pipeId, pipeDef, {upsert: true}).then(updatedPipe => {
		return res.json(200, updatedPipe);
	}).catch(error => {
		log.error(`Cannot update document: ${error}`);
		return next(errors.InternalError('Cannot update document', error));
	});
};

exports.delete = function (req, res, next) {
	var pipeId = req.params.id;
	log.debug(`Deleting pipe with id "${pipeId}"`);
	Pipe.remove({_id: pipeId}, error  => {
		if (error) {
			log.error(`Cannot delete element with id "${pipeId}": ${error}`);
			return next(errors.InternalError('Cannot delete pipe', error));
		}

		log.debug(`Deleted pipe "${pipeId}`);
		return res.json(201);
	});
};

exports.getNodeRedFlow = function(req, res, next) {
	var pipeId = req.params.id;
	Pipe.findByIdQ(pipeId).then(pipe => {
		var result = [];
		if(pipe) {
			result = convertToNodeRedFlow(pipe);
		}
		//console.log(pipe);
		return res.json(200, result);
	}).catch(error => {
		log.error('Cannot load pipe by ID "%s": ', error);
		return next(errors.NotFoundError('No such pipe: ', pipeId));
	});
};

/*
 * Recursively add UUID to all elements if they don't already have it.
 * TODO fr: currently we do it in the UI but we could think of removing it from there.
 * TODO wh: IDs assigned automatically by mongoose, remove from here
 */
//exports.addUUIDs = function addUUIDs(pipe) {
//	for (var i in pipe.elements){
//		var element = pipe.elements[i];
//		console.log(element);
//		if (!element.uuid) {
//			element.uuid = uuid.v4();
//		}
//		if (element.class === 'container') {
//			addUUIDs(element);
//		}
//	}
//};


/* HELPER METHODS */

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity('You passed a broken object', err));
};

var convertToNodeRedNode = function(pipeEl) {
	var result = {};
	result[ID] = pipeEl[ID];
	result[TYPE] = pipeEl[TYPE];
	result["wires"] = [];
	/* currently we assume that each node has only one output pin */
	var output1 = [];
	result["wires"].push(output1);
	pipeEl[EDGES_OUT].forEach(function(edge) {
		output1.push(edge);
	});
	//console.log("pipeEl[PARAMS]", pipeEl[PARAMS]);
	for(var key in pipeEl[PARAMS]) {
		if(PREDEFINED_NODERED_KEYS.indexOf(key) < 0) {
			result[key] = pipeEl[PARAMS][key];
		} else {
			log.warn("Cannot overwrite predefined parameter '" + key + "' of pipe element type " + pipeEl[TYPE]);
		}
	}
	result["x"] = pipeEl[POSITION]["x"] || 0;
	result["y"] = pipeEl[POSITION]["y"] || 0;
	result["z"] = pipeEl[POSITION]["z"] || 0;
	//console.log(result);
	return result;
};
var convertToNodeRedFlow = function(pipe) {
	var result = [];
	/* add pipe elements (nodes) */
	pipe[PIPE_ELEMENTS].forEach(function(el) {
		result.push(convertToNodeRedNode(el));
	});
	return result;
};
