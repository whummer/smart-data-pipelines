var mongoose = global.mongoose;

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