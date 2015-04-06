var log = global.log || console;

function ModelUtil() {	
}

ModelUtil.exportSchema = function(name, template) {
	var m = null;
	try {
		m = mongoose.model(name);
	} catch (e) {
		m = mongoose.model(name, template);
	}
	return m;
};

ModelUtil.exportModelSchema = function(modelClass) {
	var name = ModelUtil.getClassName(modelClass);
	var schema = ModelUtil.exportSchema(name, modelClass.getTemplate());
	modelClass._schema = schema;
	ModelUtil.CRUD(modelClass);
	return schema;
};

ModelUtil.getClassName = function(modelClass) {
	return modelClass.toString().match(/function ([^\(]+)/)[1];
};

ModelUtil.CRUD = function(modelClass) {
	modelClass.create = ModelUtil.CRUD.create;
	modelClass.find = ModelUtil.CRUD.find;
	modelClass.findOne = ModelUtil.CRUD.findOne;
};
ModelUtil.CRUD.create = function(obj, callback) {
	var resource = new this._schema(obj);
	resource.save(function(err, result) {
		if (err) {
			log.error("Could not save resource: ", err);
			callback(err);
			return;
		};
		log.debug("Successfully created new resource: ", obj);
		callback(result);
	});
};
ModelUtil.CRUD.find = function(query, callback) {
	var name = ModelUtil.getClassName(this);
	this._schema.find(query).exec(function (err, resources) {
		log.debug("Loaded %s resources for '%s'", resources.length, name);
		callback(resources);
	});
};
ModelUtil.CRUD.findOne = function(query, callback) {
	var name = ModelUtil.getClassName(this);
	this._schema.findOne(query).exec(function (err, resource) {
		log.debug("Loaded resource for '%s'", name);
		callback(resource);
	});
};

module.exports = ModelUtil;
