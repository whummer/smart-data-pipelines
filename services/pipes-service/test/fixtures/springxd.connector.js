var nock = require('nock');

nock('http://xd-admin.test.svc.cluster.local:9393')
  .post('/streams/definitions', "name=time-test-stream&definition=time%20--fixedDelay%3D10%20%7C%20log")
  .reply(201, "", { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","status":"deployed","definition":"time --fixedDelay=10 | log"}]},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","status":"deployed","definition":"time --fixedDelay=10 | log"}]},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
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
  .reply(200, "", { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","status":"undeployed","definition":"time --fixedDelay=10 | log"}]},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
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
  .reply(200, "", { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .post('/streams/deployments/doesnotexist')
  .reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/json;charset=UTF-8',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/json;charset=UTF-8',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/json;charset=UTF-8',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/json;charset=UTF-8',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(404, [{"logref":"NoSuchDefinitionException","message":"There is no stream definition named 'doesnotexist'","links":[]}], { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/json;charset=UTF-8',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.test.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_links":{"self":{"href":"http://xd-admin.test.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":0,"totalElements":0,"totalPages":1,"number":0}}, { 'x-application-context': '172.17.0.108:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });
