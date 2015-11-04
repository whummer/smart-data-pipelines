var nock = require('nock');

nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=time-test-stream&definition=time%20--fixedDelay%3D10%20%7C%20log")
  .reply(201, "", { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-length': '0',
  date: 'Thu, 22 Oct 2015 15:08:23 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:23 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:28 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:33 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:38 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:43 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .post('/streams/deployments/doesnotexist')
  .reply(500, [{"logref":"IllegalArgumentException","message":"no stream defined: doesnotexist","links":[]}], { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .get('/streams/definitions')
  .query({"page":"0","size":"500"})
  .reply(200, {"_embedded":{"streamDefinitionResourceList":[{"name":"time-test-stream","dslText":"time --fixedDelay=10 | log","status":"deploying","_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/time-test-stream"}}}]},"_links":{"self":{"href":"http://scd-admin-k8s.development.svc.cluster.local:9393/streams/definitions{?page,size,sort}","templated":true}},"page":{"size":500,"totalElements":1,"totalPages":1,"number":0}}, { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/hal+json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(500, [{"logref":"IllegalArgumentException","message":"no stream defined: doesnotexist","links":[]}], { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(500, [{"logref":"IllegalArgumentException","message":"no stream defined: doesnotexist","links":[]}], { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(500, [{"logref":"IllegalArgumentException","message":"no stream defined: doesnotexist","links":[]}], { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });


nock('http://scd-admin-k8s.development.svc.cluster.local:9393')
  .delete('/streams/deployments/doesnotexist')
  .reply(500, [{"logref":"IllegalArgumentException","message":"no stream defined: doesnotexist","links":[]}], { server: 'Apache-Coyote/1.1',
  'x-application-context': 'spring-cloud-dataflow-admin:kubernetes:9393',
  'content-type': 'application/json;charset=UTF-8',
  'transfer-encoding': 'chunked',
  date: 'Thu, 22 Oct 2015 15:08:44 GMT',
  connection: 'close' });
