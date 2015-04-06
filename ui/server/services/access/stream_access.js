var mongoose = global.mongoose;
var ModelUtil = global.ModelUtil;

function StreamAccess() {
	var model = StreamAccess.getTemplate();
	for(var i in model) {
		this[i] = null;
	}
}

StreamAccess.getTemplate = function() {
	return {
		id: String,
		streamId: String,
		requestorId: String,
		created: Date,
		status: {type: String}
	};
}

module.exports = StreamAccess;
