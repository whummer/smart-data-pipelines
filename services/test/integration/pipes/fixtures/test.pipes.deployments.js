var nock = require('nock');

nock('http://localhost:3001')
  .post('/api/v1/users/auth/local', {"email":"test1@example.com","password":"test123"})
  .reply(200, {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiJlMTk2OTk2ZTEyZDMiLCJpYXQiOjE0NDAxNzAzNDgsImV4cCI6MTQ0MDQyOTU0OH0.ZrRpLTlDgx4wz40fqWgZm5sJpUBrZtYE2vizk_blQYc"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '168',
  date: 'Fri, 21 Aug 2015 15:19:08 GMT',
  connection: 'close' });


nock('http://localhost:3001')
  .post('/api/v1/users/auth/local', {"email":"test2@example.com","password":"test123"})
  .reply(200, {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiJlNjk0MGE1YWRkNDQiLCJpYXQiOjE0NDAxNzAzNDksImV4cCI6MTQ0MDQyOTU0OX0.aofpB34kYJNCBe-jeYAqpGLWPcIuzp3ac4jePpSKOHE"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '168',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3001')
  .get('/api/v1/users/me')
  .reply(200, {"name":"test1","email":"test1@example.com","_id":"e196996e12d3","__v":0,"role":"user"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '87',
  etag: '"642564395"',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3001')
  .get('/api/v1/users/me')
  .reply(200, {"name":"test2","email":"test2@example.com","_id":"e6940a5add44","__v":0,"role":"user"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '87',
  etag: '"1665417103"',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3001')
  .get('/api/v1/organizations/default')
  .reply(200, {"__v":0,"name":"Default Organization","creator-id":"e196996e12d3","image-data":[],"domain":["37a8cb2ebb32"],"_id":"72ec7fb15776","id":"72ec7fb15776"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '150',
  etag: '"-613155193"',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3001')
  .get('/api/v1/organizations/default')
  .reply(200, {"__v":0,"name":"Default Organization","creator-id":"e6940a5add44","image-data":[],"domain":["a776ea4f935b"],"_id":"e9cde978fec4","id":"e9cde978fec4"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '150',
  etag: '"-157722155"',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3000')
  .post('/api/v1/pipes/deployments')
  .reply(400, {"error":"Invalid (empty) request body"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '40',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3000')
  .post('/api/v1/pipes/deployments', "this-is-not-valid-json")
  .reply(400, {"message":"invalid json"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '26',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3000')
  .post('/api/v1/pipes/deployments', {"pipe-id":"doesnotexist"})
  .reply(404, {"error-message":"Pipe with id 'doesnotexist' not found."}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  'content-type': 'application/json',
  'content-length': '58',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://localhost:3000')
  .post('/api/v1/pipes', {"name":"WartezeitenVisulationzPipe","description":"my cool datapipe","elements":[{"class":"container","type":"source","label":"source-container-aemter","description":"source container for meldeamt, passamt, parkpickerl","elements":[{"class":"element","type":"source","subtype":"http-out","label":"poll-meldeamt","description":"poll all meldeamt data per 10sec","options":{"url":"http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten","method":"GET","interval":10}},{"class":"element","type":"source","subtype":"http-out","label":"poll-passamt","description":"poll all passamt data per 10sec","options":{"url":"http://www.wien.gv.at/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten","method":"GET","interval":10}},{"class":"element","type":"source","subtype":"http-out","label":"poll-parkpickerl","description":"poll all pickerl data per 10sec","options":{"url":"http://www.wien.gv.at/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten","method":"GET","interval":10}}]},{"class":"container","type":"processor","label":"processor-container-aemter","description":"source container for meldeamt, passamt, parkpickerl","elements":[{"class":"element","type":"processor","subtype":"script","label":"add-discriminator-element-meldeservice","description":"Adds origin (Meldeservice)","options":{"location":"json-add-element.groovy","sync-interval":60,"variables":{"key":"origin","value":"meldeservice"}}},{"class":"element","type":"processor","subtype":"script","label":"add-discriminator-element-passservice","description":"Adds origin (Passservice)","options":{"location":"json-add-element.groovy","sync-interval":60,"variables":{"key":"origin","value":"passservice"}}},{"class":"element","type":"processor","subtype":"script","label":"add-discriminator-element-passservice","description":"Adds origin (Packpickerl)","options":{"location":"json-add-element.groovy","sync-interval":60,"variables":{"key":"origin","value":"parkpickerlservice"}}}]},{"class":"element","type":"processor","subtype":"script","label":"enrich-with-location-data","description":"enriches payload with location data","options":{"location":"enrich-json-from-csv.groovy","sync-interval":60,"variables":{"csvFile":"file:///opt/xd-data/ma-data.csv"}}},{"class":"element","type":"sink","subtype":"map","label":"visualize-data-in-map","description":"visualize data in a kibana map","options":{"index":"smartcity","type":"waitingtimes"}}]})
  .reply(201, {"id":"e98bfee716d5"}, { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin, Accept-Encoding',
  location: 'http://localhost:3000/api/v1/pipes/e98bfee716d5',
  'content-type': 'application/json',
  'content-length': '21',
  date: 'Fri, 21 Aug 2015 15:19:09 GMT',
  connection: 'close' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_processor_script_3bfc8b67-850b-48e0-9617-86d4462d69ef&definition=queue%3A3bfc8b67-850b-48e0-9617-86d4462d69ef%20%3E%20script%20--script%3Djson-add-element.groovy%20--variables%3D%27value%3Dmeldeservice%2Ckey%3Dorigin%27%20%3E%20queue%3Aa56da7e9-b9e3-4412-bab4-7a2fbf407ad8")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_processor_script_3bfc8b67-850b-48e0-9617-86d4462d69ef')
  .reply(200, {"name":"development_processor_script_3bfc8b67-850b-48e0-9617-86d4462d69ef","status":"deployed","definition":"queue:3bfc8b67-850b-48e0-9617-86d4462d69ef > script --script=json-add-element.groovy --variables='value=meldeservice,key=origin' > queue:a56da7e9-b9e3-4412-bab4-7a2fbf407ad8","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_processor_script_3bfc8b67-850b-48e0-9617-86d4462d69ef"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_processor_script_28ff0a11-f140-4b7d-88c2-6b23aa888c3b&definition=queue%3A28ff0a11-f140-4b7d-88c2-6b23aa888c3b%20%3E%20script%20--script%3Djson-add-element.groovy%20--variables%3D%27value%3Dpassservice%2Ckey%3Dorigin%27%20%3E%20queue%3Aa56da7e9-b9e3-4412-bab4-7a2fbf407ad8")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_processor_script_28ff0a11-f140-4b7d-88c2-6b23aa888c3b')
  .reply(200, {"name":"development_processor_script_28ff0a11-f140-4b7d-88c2-6b23aa888c3b","status":"deployed","definition":"queue:28ff0a11-f140-4b7d-88c2-6b23aa888c3b > script --script=json-add-element.groovy --variables='value=passservice,key=origin' > queue:a56da7e9-b9e3-4412-bab4-7a2fbf407ad8","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_processor_script_28ff0a11-f140-4b7d-88c2-6b23aa888c3b"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_processor_script_9a1bec6d-423f-462b-a421-ec15f32f6bce&definition=queue%3A9a1bec6d-423f-462b-a421-ec15f32f6bce%20%3E%20script%20--script%3Djson-add-element.groovy%20--variables%3D%27value%3Dparkpickerlservice%2Ckey%3Dorigin%27%20%3E%20queue%3Aa56da7e9-b9e3-4412-bab4-7a2fbf407ad8")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_processor_script_9a1bec6d-423f-462b-a421-ec15f32f6bce')
  .reply(200, {"name":"development_processor_script_9a1bec6d-423f-462b-a421-ec15f32f6bce","status":"deployed","definition":"queue:9a1bec6d-423f-462b-a421-ec15f32f6bce > script --script=json-add-element.groovy --variables='value=parkpickerlservice,key=origin' > queue:a56da7e9-b9e3-4412-bab4-7a2fbf407ad8","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_processor_script_9a1bec6d-423f-462b-a421-ec15f32f6bce"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_source_http_out_c20edeaa-6aa4-4787-8d17-7bacd46f4e9d&definition=trigger%20--fixedDelay%3D10%20%7C%20http-client%20--url%3D%27%27%27http%3A%2F%2Fwww.wien.gv.at%2Fwartezeiten%2Fpassservice%2Fwartezeiten.svc%2FGetWartezeiten%27%27%27%20--httpMethod%3DGET%20%3E%20queue%3A28ff0a11-f140-4b7d-88c2-6b23aa888c3b")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_source_http_out_c20edeaa-6aa4-4787-8d17-7bacd46f4e9d')
  .reply(200, {"name":"development_source_http_out_c20edeaa-6aa4-4787-8d17-7bacd46f4e9d","status":"deployed","definition":"trigger --fixedDelay=10 | http-client --url='''http://www.wien.gv.at/wartezeiten/passservice/wartezeiten.svc/GetWartezeiten''' --httpMethod=GET > queue:28ff0a11-f140-4b7d-88c2-6b23aa888c3b","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_source_http_out_c20edeaa-6aa4-4787-8d17-7bacd46f4e9d"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_processor_script_a56da7e9-b9e3-4412-bab4-7a2fbf407ad8&definition=queue%3Aa56da7e9-b9e3-4412-bab4-7a2fbf407ad8%20%3E%20script%20--script%3Denrich-json-from-csv.groovy%20--variables%3D%27csvFile%3Dfile%3A%2F%2F%2Fopt%2Fxd-data%2Fma-data.csv%27%20%3E%20queue%3A4a6476e9-e0e6-416c-b2ea-89eafeca0afb")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_processor_script_a56da7e9-b9e3-4412-bab4-7a2fbf407ad8')
  .reply(200, {"name":"development_processor_script_a56da7e9-b9e3-4412-bab4-7a2fbf407ad8","status":"deployed","definition":"queue:a56da7e9-b9e3-4412-bab4-7a2fbf407ad8 > script --script=enrich-json-from-csv.groovy --variables='csvFile=file:///opt/xd-data/ma-data.csv' > queue:4a6476e9-e0e6-416c-b2ea-89eafeca0afb","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_processor_script_a56da7e9-b9e3-4412-bab4-7a2fbf407ad8"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_source_http_out_612ba56c-de99-4119-8614-0ca3c2219f22&definition=trigger%20--fixedDelay%3D10%20%7C%20http-client%20--url%3D%27%27%27http%3A%2F%2Fwww.wien.gv.at%2Fwartezeiten%2Fparkpickerl%2Fwartezeiten.svc%2FGetWartezeiten%27%27%27%20--httpMethod%3DGET%20%3E%20queue%3A9a1bec6d-423f-462b-a421-ec15f32f6bce")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_source_http_out_612ba56c-de99-4119-8614-0ca3c2219f22')
  .reply(200, {"name":"development_source_http_out_612ba56c-de99-4119-8614-0ca3c2219f22","status":"deployed","definition":"trigger --fixedDelay=10 | http-client --url='''http://www.wien.gv.at/wartezeiten/parkpickerl/wartezeiten.svc/GetWartezeiten''' --httpMethod=GET > queue:9a1bec6d-423f-462b-a421-ec15f32f6bce","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_source_http_out_612ba56c-de99-4119-8614-0ca3c2219f22"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_source_http_out_679ed4dc-c070-4fa1-9b98-51e3add29dc5&definition=trigger%20--fixedDelay%3D10%20%7C%20http-client%20--url%3D%27%27%27http%3A%2F%2Fwww.wien.gv.at%2Fwartezeiten%2Fmeldeservice%2Fwartezeiten.svc%2FGetWartezeiten%27%27%27%20--httpMethod%3DGET%20%3E%20queue%3A3bfc8b67-850b-48e0-9617-86d4462d69ef")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_source_http_out_679ed4dc-c070-4fa1-9b98-51e3add29dc5')
  .reply(200, {"name":"development_source_http_out_679ed4dc-c070-4fa1-9b98-51e3add29dc5","status":"deployed","definition":"trigger --fixedDelay=10 | http-client --url='''http://www.wien.gv.at/wartezeiten/meldeservice/wartezeiten.svc/GetWartezeiten''' --httpMethod=GET > queue:3bfc8b67-850b-48e0-9617-86d4462d69ef","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_source_http_out_679ed4dc-c070-4fa1-9b98-51e3add29dc5"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .post('/streams/definitions', "name=development_sink_map_visualization_4a6476e9-e0e6-416c-b2ea-89eafeca0afb&definition=queue%3A4a6476e9-e0e6-416c-b2ea-89eafeca0afb%20%3E%20elasticsearch%20--mode%3Dtransport%20--guessSchemas%3Dtrue%20--addTimestamp%3Dtrue%20--clusterName%3Delasticsearch%20--hosts%3Delasticsearch.development.svc.cluster.local%3A9300%20--index%3Dsmartcity%20--type%3Dwaitingtimes")
  .reply(201, "", { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://xd-admin.development.svc.cluster.local:9393')
  .get('/streams/definitions/development_sink_map_visualization_4a6476e9-e0e6-416c-b2ea-89eafeca0afb')
  .reply(200, {"name":"development_sink_map_visualization_4a6476e9-e0e6-416c-b2ea-89eafeca0afb","status":"deployed","definition":"queue:4a6476e9-e0e6-416c-b2ea-89eafeca0afb > elasticsearch --mode=transport --guessSchemas=true --addTimestamp=true --clusterName=elasticsearch --hosts=elasticsearch.development.svc.cluster.local:9300 --index=smartcity --type=waitingtimes","_links":{"self":{"href":"http://xd-admin.development.svc.cluster.local:9393/streams/development_sink_map_visualization_4a6476e9-e0e6-416c-b2ea-89eafeca0afb"}}}, { 'x-application-context': '172.17.0.6:9393',
  'access-control-allow-origin': 'http://localhost:9889',
  'access-control-expose-headers': 'Location',
  pragma: 'no-cache',
  expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
  'cache-control': 'no-cache, no-store',
  'content-type': 'application/hal+json',
  connection: 'close',
  server: 'Jetty(8.1.14.v20131031)' });


nock('http://localhost:3000')
  .post('/api/v1/pipes/deployments', {"pipe-id":"e98bfee716d5"})
  .reply(201, "", { 'x-powered-by': 'Express',
  'access-control-allow-origin': '*',
  vary: 'Origin',
  date: 'Fri, 21 Aug 2015 15:19:33 GMT',
  connection: 'close',
  'transfer-encoding': 'chunked' });
