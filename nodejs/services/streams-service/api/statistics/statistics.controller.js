'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var demo = require('./statistics');

var getLocation = function(ip) {
	var url = "http://getcitydetails.geobytes.com/GetCityDetails?fqcn=";
	// TODO
};

exports.getStats = function(ip) {
	
};

exports.live = {};
exports.live.connect = function(ws, req) {
	//console.log("ws", ws, req);
	ws.on('message', function(evt) {
		var msg = JSON.parse(evt);
		if(msg[TYPE] == MSGTYPE_SUBSCRIBE) {
			var interval = msg.interval;
			if(!interval || interval < 500) interval = 2000;
			ws.__options = ws.__options || {};
			ws.__options.interval = interval;
			if(!ws.__options.started) {
				ws.__options.started = true;
				sendData(ws);
			}
		}
	});
};

var sendData = function(ws) {
	var res = {};
	res[TYPE] = MSGTYPE_DATA;
	res[PAYLOAD] = demo;
	try {
		ws.send(JSON.stringify(res));
		setTimeout(function() {
			sendData(ws);
		}, ws.__options.interval);
	} catch (e) {
		/* stop sending */
	}
};
