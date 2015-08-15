'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var Proxy = require('./proxy.model.js');
var log = global.log || require('winston');

exports.show = function(req, res) {
	var query = {};
	Proxy.find(query, function(err, proxies) {
		if(err || !proxies)
			return res.status(500).json({error: "Unable to get proxies: " + err});
		res.json(proxies);
	});
};

function list(query, req, res, next) {
	Proxy.find(query, function (err, list) {
		if (err) {
			return next(errors.InternalError("Unable to list proxies", err));
		}
		res.json(list);
	});
}

exports.list = function (req, res, next) {
	var user = auth.getCurrentUser(req);
	var query = {};
	var orgIDs = user.getOrganizationIDs();
	query[ORGANIZATION_ID] = { "$in": orgIDs };
	return list(query, req, res, next);
};

exports.listAll = function (req, res, next) {
	var query = {};
	if(req.query[ORGANIZATION_ID]) {
		query[ORGANIZATION_ID] = req.query[ORGANIZATION_ID];
	}
	if(typeof req.query[DOMAIN_NAME] != "undefined") {
		query[DOMAIN_NAME] = req.query[DOMAIN_NAME];
		if(query[DOMAIN_NAME] === "") {
			query[DOMAIN_NAME] = {"$or": [{"$exists": false}, {"$exists": true, "$eq": ""}]};
		}
	}
	return list(query, req, res, next);
};

exports.create = function (req, res, next) {
	var proxy = new Proxy(req.body);

	if (!proxy.connector || proxy.connector.type != "http") {
		return validationError("Unsupported Connector-Type. Only HTTP is supported at the moment", next);
	}
	if (!proxy[ORGANIZATION_ID]) {
		return validationError("Please provide a valid " + ORGANIZATION_ID + ".", next);
	}
	if (!proxy[PERMIT_MODE]) {
		return validationError("Please provide a valid " + PERMIT_MODE + ".", next);
	}
	// TODO check if ORGANIZATION_ID belongs to calling user!

	proxy.save(function (err, obj) {
		if (err) {
			return validationError(err, next);
		}
		res.json(obj);
	});
};

exports.update = function (req, res, next) {
	if(req.body[ID] != req.params.id) {
		return errorCallback(errors.UnprocessableEntity("Invalid entity IDs."));
	}
	Proxy.findById(req.params.id, function (err, obj) {
		if (err)
			return errorCallback(errors.InternalError("Cannot update", err));
		if (!obj)
			return errorCallback(errors.NotFoundError("No such entity: " + id));

		// TODO: check permission

		/* copy values */
		obj[NAME] = req.body[NAME];
		obj[OPERATIONS] = req.body[OPERATIONS];
		obj[SCHEMAS] = req.body[SCHEMAS];
		obj[DOMAIN_NAME] = req.body[DOMAIN_NAME];
		obj[BACKEND_ENDPOINTS] = req.body[BACKEND_ENDPOINTS];
		obj[CONNECTOR] = req.body[CONNECTOR];
		obj[ORGANIZATION_ID] = req.body[ORGANIZATION_ID];
		obj[PUBLIC_ACCESS] = req.body[PUBLIC_ACCESS];

		obj.save(function (err, obj) {
			if (err) {
				return validationError(err, next);
			}
			/* return result */
			res.json(obj);
		});
	});

};

exports.show = function (req, res, next) {
	var id = req.params.id;

	Proxy.findById(id, function (err, obj) {
		if (err) {
			return next(errors.InternalError("Cannot lookup entity", err));
		}
		if (!obj) {
			return next(errors.NotFoundError("No such entity: " + id));
		}
		/* return result */
		res.json(obj);
	});
};

exports.destroy = function (req, res) {
	/* TODO check permissions */
	var id = req.param.id;
	Proxy.findByIdAndRemove(id, function (err) {
		if (err) {
			return next(erros.InternalError("Cannot remove entity with id " + id, err));
		}
		return res.send(204);
	});
};

var validationError = function (err, next) {
	return next(errors.UnprocessableEntity("You passed a broken object", err));
};
