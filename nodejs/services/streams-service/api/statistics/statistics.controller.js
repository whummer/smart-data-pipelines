'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var demo = require('./statistics');

exports.queryInvocationStats = function(req, res) {
	var query = req.body;
	var user = auth.getCurrentUser(req);
	
	var doQuery = function() {
		var headers = auth.getInternalCallTokenHeader();
		riox.ratings.invocations(query, {
			headers: headers,
			callback: function(invocations) {
				var stats = {};
				var numErrors = 0;
				stats.numInvocations = 0;
				stats.status = {};
				for(var i = 0; i < invocations.length; i ++) {
					var inv = invocations[i];
					stats.numInvocations += inv.count;
					var status = inv[RESULT_STATUS];
					stats.status[status] = (stats.status[status] || 0) + 1;
				}
				if(query.details) {
					stats.details = invocations;
				}
				res.json(stats);
			}
		});
	};

	if(query[OPERATION_ID]) {
		doQuery();
	} else {
		query[OPERATION_ID] = [];
		/* collect operations of this user */
		riox.streams.sources({}, function(list) {
			list.forEach(function(source) {
				source[OPERATIONS].forEach(function(operation) {
					query[OPERATION_ID].push(operation[ID]);
				});
			});
			doQuery();
		});
	}
	
};

exports.live = {};
exports.live.connect = function(ws, req) {
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

/* HELPER METHODS */

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

var getLocation = function(ip) {
	var url = "http://getcitydetails.geobytes.com/GetCityDetails?fqcn=";
	// TODO
};
