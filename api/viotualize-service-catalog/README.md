Microservice "Catalog"
======================

The module "catalog-service" implements our edge service for managing a catalog of [SmartObject](../../../../wiki/2.-Terminology)s. It provides user the ability to add private or public entries, search entires, rate entries, etc. 


# Compile

```bash
mvn clean package
```

# Run

## Standalone JAR

*TODO* wrap the commands below into `run-standalone.sh` or similar

```bash
export CATALOG_SERVICE_LOGDIR=/tmp/catalog-service-logs
mkdir -p $CATALOG_SERVICE_LOGDIR

# default service port is 8080; if you run all services on your dev machine you need to change it
# to avoid conflicts. 
java -DVIOTUALIZE_LOG_DIR=$CATALOG_SERVICE_LOGDIR -Dserver.port=8081 \
     -jar target/catalog-service-*.jar
```

## Docker

simply execute `run.sh` from the `target/` folder

# Runtime dependencies

In the test environment, it expects the following services:
  * Eureka at [http://localhost:10000/eureka](http://localhost:10000/eureka).
  * MongoDB at `tcp://localhost:27017`.
  * Optional: Logstash and ElasticSearch

See [here](../../README.md) on how to lauch these services as docker containers. 

# Problems

Please file an [issue](../../../../issues) so we can look into it.	
