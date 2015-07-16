'use strict';

var auth = require('riox-services-base/lib/auth/auth.service');
var riox = require('riox-shared/lib/api/riox-api');
var demo = require('./statistics');

exports.queryInvocationStats = function(req, res) {
	var query = req.body;
	var headers = auth.getInternalCallTokenHeader();
	queryInvocations(query, headers, function(stats) {
		res.json(stats);
		res.end();
	});
};

var queryInvocations = function(query, headers, callback) {
	var doQuery = function() {
		riox.ratings.invocations(query, {
			headers: headers,
			callback: function(invocations) {
				var stats = {};
				var numErrors = 0;
				stats.numInvocations = 0;
				stats.status = {};
				for(var i = 0; i < invocations.length; i ++) {
					var inv = invocations[i];
					for(var key in inv.ips) {
						var val = inv.ips[key];
						for(var j = 0; j < val.resultStatus.length; j ++) {
							var status = val.resultStatus[j];
							stats.status[status] = (stats.status[status] || 0) + 1;
						}
					}
					stats.numInvocations += inv.count;
				}
				if(query.details) {
					stats.details = invocations;
				}
				callback(stats);
			}
		});
	};

	if(query[OPERATION_ID]) {
		/* TODO check permission to access the operation data */
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

var queryLiveInvocations = function(query, headers, callback, errorCallback) {
	queryInvocations(query, headers, function(stats) {
		callback(stats);
	});
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
				sendData(ws, msg);
			}
		}
	});
};

/* HELPER METHODS */

var getAuthHeader = function(req) {
	return { cookie: req.headers.cookie };
};

var sendData = function(ws, subMsg, query, headers) {
	var res = {};
	res[TYPE] = MSGTYPE_DATA;
	
	setTimeout(function() {
		if(!query) 
			query = {};
		if(!query[TIME_TO])
			query[TIME_TO] = new Date().getTime() - ws.__options.interval;
		query[TIME_FROM] = query[TIME_TO];
		query[TIME_TO] = new Date().getTime();
		if(!headers) {
			headers = getAuthHeader(ws.upgradeReq);
		}
		queryLiveInvocations(query, headers, function(data) {
			res[PAYLOAD] = data;
			try {
				ws.send(JSON.stringify(res));
				sendData(ws, subMsg, query, headers);
			} catch (e) {
				/* stop sending */
			}
		}, function(err) {
			console.log("Error querying invocations", err);
		});
	}, ws.__options.interval);
};
