var uuid = require('node-uuid');

var x = {};

x.genShortUUID = global.genShortUUID = function() {
    var id = uuid.v4()
    /* trim to the last 12 chars */
    id = id.substring(id.length - 12);
    return id;
};

module.exports = x;
