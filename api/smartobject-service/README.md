Microservice "SmartObject"
=========================

The module "smartobject-service" implements our middle-tier service by providing a SmartObject REST API.


# Compile

	`mvn clean package`

# Run

    ```
    export SMARTOBJECT_SERVICE_LOGDIR=/tmp/smartobject-service-logs # choose any folder you like 
	mkdir -p $SMARTOBJECT_SERVICE_LOGDIR

	# default port is 8080; if you run all service on your dev machine you need to change it
	java -DVIOTUALIZE_LOG_DIR=$SMARTOBJECT_SERVICE_LOGDIR -Dserver.port=8082 -jar target/smartobject-service.jar
	```

# Runtime dependencies

In the test environment, it expects the following services:
  * Eureka at [http://localhost:10000/eureka]().
  * MongoDB at [tcp://localhost:27017]().

See [here](https://github.com/riox/viotualize/blob/spring-boot-netflix/README.md) on how to lauch these services as docker containers. 

# Problems

	Please file an issue so we can look into it.	
