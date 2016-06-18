## Elasticsearch Sink for Spring Cloud Data Flow

This very simple [Elasticsearch](http://www.elastic.co) Sink implementation for Spring Cloud Data Flow
is based on the [Spring-XD version](https://github.com/mbogoevici/elasticsearch-sink) contributed by Marius Bogoevici.

## Build, Install and Deploy

To build this sink, follow standard maven protocol:

```
mvn clean package
```

Please note that for the `transport` mode integration tests you need a local Elasticsearch instance up and
running on port `9300`.


#### Deploy Maven artifacts
```
mvn -Priox deploy
```

#### Build and deploy the docker image

```
mvn docker:build -DpushImage


Please note that you have to provide valid credentials for Riox maven repos, so put the following
into your `settings.xml` into the `servers` section:

```
<server>
  <id>riox-releases-repo</id>
  <username>************</username>
  <password>************</password>
 </server>
 <server>
   <id>riox-snapshots-repo</id>
   <username>************</username>
   <password>************</password>
</server>
```
