'use strict';

var Pipe = require('./pipe.model.js').Model;
var	errors = require('riox-services-base/lib/util/errors');
var	auth = require('riox-services-base/lib/auth/auth.service');
var	log = global.log;
var uuid = require('node-uuid');

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
		log.debug('Found pipe with ID %s', pipeId);
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

	exports.addUUIDs(pipe);

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


/*
 * Recursively add UUID to all elements if they don't already have it.
 * TODO fr: currently we do it in the UI but we could think of removing it from there.
 */
exports.addUUIDs = function addUUIDs(pipe) {
	for (var i in pipe.elements){
		var element = pipe.elements[i];
		if (!element.uuid) {
			element.uuid = uuid.v4();
		}
		if (element.class === 'container') {
			addUUIDs(element);
		}
	}
};

//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity('You passed a broken object', err));
};
