Microservice "Environment"
=========================

The module "environment-service" implements a middle-tier service for managing [SmartEnvironment](../../../../wiki/2.-Terminology)s. 


# Compile
```bash
mvn clean package
```

# Run

## Standalone JAR

*TODO* wrap the commands below into `run-standalone.sh` or similar

```bash
export ENVIRONMENT_SERVICE_LOGDIR=/tmp/environment-service-logs 
mkdir -p $ENVIRONMENT_SERVICE_LOGDIR

# default service port is 8080; if you run all services on your dev machine you need to change it
# to avoid conflicts. 
java -DVIOTUALIZE_LOG_DIR=$ENVIRONMENT_SERVICE_LOGDIR -Dserver.port=8082 \
     -jar target/environment-service-*.jar 
```

## Docker

simply execute `run.sh` from the `target/` folder

# Runtime dependencies

In the test environment, it expects the following services:
  * Eureka at [http://localhost:10000/eureka](http://localhost:10000/eureka).
  * MongoDB at `tcp://localhost:27017`.
  * Optional: Logstash and ElasticSearch

See [here](https://github.com/riox/viotualize/blob/spring-boot-netflix/README.md) on how to lauch these services as docker containers. 

# Problems

Please file an [issue](../../../../issues) so we can look into it.
