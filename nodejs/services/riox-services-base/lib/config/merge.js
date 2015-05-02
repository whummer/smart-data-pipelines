var merge = require('merge');

module.exports = function(obj1, obj2) {
	if(!obj1) obj1 = {};
	if(!obj2) obj2 = {};
	var result = merge.recursive(true, obj1, obj2);
	return result;
};
