
function listUsers(req, res, next) {
	res.send("foo");
	next();
}

var server = global.server;
var ROOT_PATH = "/users";
server.get(ROOT_PATH + "/", listUsers);

