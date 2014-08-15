Microservice "Catalog"
======================

The module "catalog-service" implements our edge service by providing a Catalog REST API.


# Compile

	`mvn clean package`

# Run

    ```
    export CATALOG_SERVICE_LOGDIR=/tmp/catalog-service-logs # choose any folder you like 
	mkdir -p $CATALOG_SERVICE_LOGDIR

	# default port is 8080; if you run all services on your dev machine you need to change it
	java -DVIOTUALIZE_LOG_DIR=$CATALOG_SERVICE_LOGDIR -Dserver.port=8081 -jar target/catalog-service.jar
	```

# Runtime dependencies

In the test environment, it expects the following services:
  * Eureka at [http://localhost:10000/eureka]().
  * MongoDB at [tcp://localhost:27017]().

See [here](https://github.com/riox/viotualize/blob/spring-boot-netflix/README.md) on how to lauch these services as docker containers. 

# Problems

	Please file an issue so we can look into it.	
