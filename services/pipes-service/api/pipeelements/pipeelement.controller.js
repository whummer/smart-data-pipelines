'use strict';

var PipeElement = require('./pipeelement.model.js').Model,
		errors = require('riox-services-base/lib/util/errors'),
		auth = require('riox-services-base/lib/auth/auth.service'),
		log = global.log;

exports.listAll = function (req, res, next) {
	var query = req.query || {};
	log.debug('Listing all pipe elements. Query: ', query);
	PipeElement.findQ({}).then(pipes => {
		if (!pipes || pipes.length == 0) {
			return next(errors.NotFoundError('No pipes found'));
		}

		log.info('Loaded %d pipe elements', pipes.length);
		return res.json(200, pipes);
	}).catch(error => {
		log.error('Cannot list pipe elements: ', error);
		return next(errors.InternalError('Cannot list pipe elements', error));
	});
};

exports.update = function(req, res, next) {
	log.debug('Updating pipe element: %s', req.body);
};

exports.create = function (req, res, next) {
	var pipeElement = new PipeElement(req.body);
	var user = auth.getCurrentUser(req);
	pipeElement[CREATOR_ID] = user[ID];

	pipeElement.saveQ().then(savedElement => {
		log.info('Saved pipe element with ID: ', savedElement._id);
		return res.json(savedElement);
	}).catch(error => {
		log.error('Could not save pipe element: ', error);
		return validationError(error, next);
	});
};

exports.delete = function (req, res, next) {
	var elementId = req.params.id;
	log.debug('Deleting element with id %d', elementId);
	PipeElement.removeQ({_id: elementId}).catch(error => {
		log.error('Cannot delete element with id %d: %s', elementId, error);
		return next(errors.InternalError('Cannot delete element', error));
	});
};

exports.findById = function(req,res,next) {
	var elementId = req.params.id;
	log.debug('Finding element by id %s', pipeId);
	PipeElement.findByIdQ(elementId).then(element => {
		log.debug('Found element with ID %s', elementId);
		return res.json(200, element);
	}).catch(error => {
		log.error('Cannot load element by ID "%s": ', error);
		return next(errors.NotFoundError('No such element: ', pipeId));
	})
}

//
// helpers
//
var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};

