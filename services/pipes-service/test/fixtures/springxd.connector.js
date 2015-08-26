var nock = require('nock');

nock('http://xd-admin.test.svc.cluster.local:9393')
	.post('/streams/definitions', "name=time-test-stream&definition=time%20--fixedDelay%3D10%20%7C%20log")
	.reply(201, "", { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/time-test-stream')
	.reply(200, {"name":"time-test-stream","status":"deployed","definition":"time --fixedDelay=10 | log","_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/time-test-stream"}}}, { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/hal+json',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/time-test-stream')
	.reply(200, {"name":"time-test-stream","status":"deployed","definition":"time --fixedDelay=10 | log","_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/time-test-stream"}}}, { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/hal+json',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.delete('/streams/deployments/time-test-stream')
	.reply(200, "", { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/time-test-stream')
	.reply(200, {"name":"time-test-stream","status":"undeployed","definition":"time --fixedDelay=10 | log","_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/time-test-stream"}}}, { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/hal+json',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.delete('/streams/definitions/time-test-stream')
	.reply(200, "", { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/time-test-stream')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'time-test-stream'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.post('/streams/deployments/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.delete('/streams/deployments/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.delete('/streams/deployments/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.delete('/streams/deployments/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.delete('/streams/deployments/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
	.get('/streams/definitions/doesnotexist')
	.reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.15:9393',
	'access-control-allow-origin': 'http://localhost:9889',
	'access-control-expose-headers': 'Location',
	pragma: 'no-cache',
	expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
	'cache-control': 'no-cache, no-store',
	'content-type': 'application/json;charset=UTF-8',
	connection: 'close',
	server: 'Jetty(8.1.14.v20131031)' });
