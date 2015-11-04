var nock = require('nock');

nock('http://localhost:8080')
  .post('/api/v1/namespaces/development/services', {"metadata":{"name":"source123","labels":{"role":"scsm-module","scsm-group":"source123","scsm-label":"http-in"}},"spec":{"type":"ClusterIP","selector":{"scsm-group":"source123","scsm-label":"http-in"},"sessionAffinity":"None","ports":[{"protocol":"TCP","port":6789,"targetPort":6789}]}})
  .reply(409, {"kind":"Status","apiVersion":"v1","metadata":{},"status":"Failure","message":"service \"source123\" already exists","reason":"AlreadyExists","details":{"name":"source123","kind":"service"},"code":409}, { 'content-type': 'application/json',
  date: 'Fri, 30 Oct 2015 18:12:34 GMT',
  'content-length': '249',
  connection: 'close' });


nock('http://localhost:8080')
  .post('/api/v1/namespaces/development/replicationcontrollers', {"metadata":{"name":"source123","labels":{"name":"source123","role":"scsm-module","scsm-artifactId":"http-source","scsm-groupId":"riox","scsm-version":"1.0.0.BUILD-SNAPSHOT","scsm-group":"source123","scsm-label":"http-in"}},"spec":{"replicas":1,"selector":{"scsm-group":"source123","scsm-label":"http-in"},"template":{"metadata":{"labels":{"name":"source123","scsm-group":"source123","scsm-label":"http-in"}},"spec":{"imagePullSecrets":[{"name":"rioxregistrykey"}],"dnsPolicy":"Default","restartPolicy":"Always","containers":[{"name":"source123","image":"riox/spring-cloud-stream-module-http-source:1.0.0.BUILD-SNAPSHOT","imagePullPolicy":"Always","env":[],"ports":[{"protocol":"TCP","containerPort":6789}],"args":["--server.port=6789"]}]}}}})
  .reply(409, {"kind":"Status","apiVersion":"v1","metadata":{},"status":"Failure","message":"replicationControllers \"source123\" already exists","reason":"AlreadyExists","details":{"name":"source123","kind":"replicationControllers"},"code":409}, { 'content-type': 'application/json',
  date: 'Fri, 30 Oct 2015 18:12:34 GMT',
  'content-length': '279',
  connection: 'close' });
