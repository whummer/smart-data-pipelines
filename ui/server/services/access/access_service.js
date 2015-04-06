var StreamAccess = require('./stream_access.js');


function list(req, res, next) {
	var query = {};
	StreamAccess.find(query, function(result) {
		res.send(result);
		next();
	});
}
function getByStream(req, res, next) {
	var query = {streamId: req.params.id};
	return read(query, req, res, next);
}
function getById(req, res, next) {
	var query = {_id: req.params.id};
	return read(query, req, res, next);
}
function read(query, req, res, next) {
	StreamAccess.findOne(query, function(result) {
		if(result) {
			res.send(result);
		}
		next();
	});
}
function create(req, res, next) {
	var access = JSON.parse(req.body);
	StreamAccess.create(access, function(access) {
		res.send(access);
		next();
	});
}

/* export schemas to mongo */
ModelUtil.exportModelSchema(StreamAccess);

/* expose service methods */
var server = global.server;
var ROOT_PATH = "/api/v1/access";
server.get(ROOT_PATH + "/", list);
server.get(ROOT_PATH + "/:id", getById);
server.get(ROOT_PATH + "/stream/:id", getByStream);
server.post(ROOT_PATH + "/", create);

