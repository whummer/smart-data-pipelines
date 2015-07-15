var express = require('express'),
    bodyParser = require('body-parser');

var app = express().use(bodyParser.json());

var users = [{ name : "Walde Hummer"}];

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/users', function (req, res) {
  res.send(users);
});

app.post('/users', function (req, res) {
	users.push(req.body);
	res.status(200).send("OK");
});

app.get('/calendar', function(req, res) {
	res.send("No appointments. Hooray!")
});

var server = app.listen(process.argv[2] || 3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
