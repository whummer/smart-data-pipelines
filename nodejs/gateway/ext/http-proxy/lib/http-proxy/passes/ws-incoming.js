var
	_ = require('lodash'),
	http = require('http'),
	https = require('https'),
	common = require('../common'),
	logger = require('winston'),
	passes = exports,
//	KafkaTransformer = require('./kafka-transformer.js'), // TODO kafka-fix
	util = require('util');

/*!
 * Array of passes.
 *
 * A `pass` is just a function that is executed on `req, socket, options`
 * so that you can easily add new checks while still keeping the base
 * flexible.
 */

/*
 * Websockets Passes
 *
 */

var passes = exports;

[
	/**
	 * WebSocket requests must have the `GET` method and
	 * the `upgrade:websocket` header
	 *
	 * @param {ClientRequest} Req Request object
	 * @param {Socket} Websocket
	 *
	 * @api private
	 */

		function checkMethodAndHeader(req, socket) {
		if (req.method !== 'GET' || !req.headers.upgrade) {
			socket.destroy();
			return true;
		}

		if (req.headers.upgrade.toLowerCase() !== 'websocket') {
			socket.destroy();
			return true;
		}
	},

	/**
	 * Sets `x-forwarded-*` headers if specified in config.
	 *
	 * @param {ClientRequest} Req Request object
	 * @param {Socket} Websocket
	 * @param {Object} Options Config object passed to the proxy
	 *
	 * @api private
	 */

		function XHeaders(req, socket, options) {
		if (!options.xfwd) return;

		var values = {
			for: req.connection.remoteAddress || req.socket.remoteAddress,
			port: common.getPort(req),
			proto: common.hasEncryptedConnection(req) ? 'wss' : 'ws'
		};

		['for', 'port', 'proto'].forEach(function (header) {
			req.headers['x-forwarded-' + header] =
				(req.headers['x-forwarded-' + header] || '') +
				(req.headers['x-forwarded-' + header] ? ',' : '') +
				values[header];
		});
	},

	/**
	 * Does the actual proxying. Make the request and upgrade it
	 * send the Switching Protocols request and pipe the sockets.
	 *
	 * @param {ClientRequest} Req Request object
	 * @param {Socket} Websocket
	 * @param {Object} Options Config object passed to the proxy
	 *
	 * @api private
	 */
		function stream(req, socket, options, head, server, clb) {
		logger.debug("ws-incoming::stream");
		common.setupSocket(socket);

		if (head && head.length) socket.unshift(head);


		logger.debug('extensions: ', options.extensions);

		var proxyReq = (common.isSSL.test(options.target.protocol) ? https : http).request(
			common.setupOutgoing(options.ssl || {}, options, req)
		);
		// Error Handler
		proxyReq.on('error', onOutgoingError);
		proxyReq.on('response', function (res) {
			// if upgrade event isn't going to happen, close the socket
			if (!res.upgrade) socket.end();
		});

		proxyReq.on('upgrade', function (proxyRes, proxySocket, proxyHead) {
			proxySocket.on('error', onOutgoingError);

			// Allow us to listen when the websocket has completed
			proxySocket.on('end', function () {
				server.emit('close', proxyRes, proxySocket, proxyHead);
			});

			// The pipe below will end proxySocket if socket closes cleanly, but not
			// if it errors (eg, vanishes from the net and starts returning
			// EHOSTUNREACH). We need to do that explicitly.
			socket.on('error', function () {
				proxySocket.end();
			});

			common.setupSocket(proxySocket);

			if (proxyHead && proxyHead.length) proxySocket.unshift(proxyHead);

			socket.write('HTTP/1.1 101 Switching Protocols\r\n');
			socket.write(Object.keys(proxyRes.headers).map(function (i) {
				return i + ": " + proxyRes.headers[i];
			}).join('\r\n') + '\r\n\r\n');

			proxySocket
				.pipe(socket)
				.pipe(proxySocket);

			// add configured extensions
			_.each(options.extensions, function(extension) {
				if (extension.enabled) {
					logger.info('Enabling extension: %s -> %s', extension.name, extension.enabled);
					proxySocket.pipe(setupExtension(extension, options.context));
				} else {
					logger.debug('Extension is disabled: %s', extension.name);
				}
			});

			server.emit('open', proxySocket);
			server.emit('proxySocket', proxySocket);  //DEPRECATED.
		});

		return proxyReq.end(); // XXX: CHECK IF THIS IS THIS CORRECT

		function onOutgoingError(err) {
			if (clb) {
				clb(err, req, socket);
			} else {
				server.emit('error', err, req, socket);
			}
			socket.end();
		}

	}

] // <--
	.forEach(function (func) {
		passes[func.name] = func;
	});


function setupExtension(extension, context) {
	switch (extension.name) {
//		case 'kafka' : return new KafkaTransformer("kafka-interceptor", context); // TODO kafka-fix
		default : throw new Error('Unknown extension: ' + extension.name);
	}

}
