'use strict';

var Pipe = require('./pipe.model.js').Model,
		errors = require('riox-services-base/lib/util/errors'),
		auth = require('riox-services-base/lib/auth/auth.service'),
		log = global.log;

exports.listAll = function (req, res, next) {
	Pipe.findQ({}).then(pipes => {
		if (!pipes || pipes.length == 0) {
			return next(errors.NotFoundError('No pipes found'));
		}

		log.info('Loaded %d pipes', pipes.length);
		return res.json(200, pipes);
	}).catch(error => {
		log.error('Cannot list pipes: ', error);
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
	})
};

exports.create = function (req, res, next) {
	var pipeDef = req.body;
	var pipe = new Pipe(pipeDef);
	var user = auth.getCurrentUser(req);
	pipe[CREATOR_ID] = user[ID];

	pipe.saveQ().then(savedPipe => {
		log.info('Saved pipe with ID: ', savedPipe._id);
		res.setHeader('Location', req.getUrl() + '/' + savedPipe._id);
		return res.json(201, { "id" : savedPipe.id });
	}).catch(error => {
		return validationError(error, next);
	});
};

exports.update = function (req, res, next) {
	var pipeId = req.params.id;
	var pipeDef = req.body;
	log.debug('Updating pipe "%s": %s', pipeId, pipeDef);
	Pipe.findByIdAndUpdate(pipeId, pipeDef, {upsert: true}, function (err, doc) {
		if (err) {
			log.error("Cannot update document: ", err);
			return next(errors.InternalError("Cannot update document ", err));
		}

		return res.json(200, doc);
	});
};

exports.delete = function (req, res, next) {
	var pipeId = req.params.id;
	log.debug('Deleting pipe with id %s', pipeId);
	Pipe.remove({_id: pipeId}, error  => {
		if (error) {
			log.error('Cannot delete element with id %d: %s', pipeId, error);
			return next(errors.InternalError('Cannot delete element', error));
		}

		log.debug('Deleted pipe %s', pipeId);
		return res.json(201);
	});
};


//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
