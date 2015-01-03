# Compile and Test

We use [Maven](http://maven.apache.org/) as our build system.  To build issue the following command:

```bash
mvn clean install 
```

After that you should be able to run all services. Please see further down on how to start the services. 
Before you do that you need to start some depending infrastructure pieces (service registry and mongo).

# Deployment

This section describes how to deploy our infrastructure for dev & test. At some point we will have a script
to orchestrate the deployment but for now a few manual commands will do.

## Prerequisites

We leverage [docker.io](http://docker.io), so a docker installation on the dev machine is necessary. If you are using a Mac,
we suggest to use [boot2docker](https://github.com/boot2docker/boot2docker). It is based on VirtualBox, so you will need forwarding rules to access any service via localhost (more below).

## Core Service Deployment

For a successful deployment we need two supporting service: MongoDB and Netflix Eureka (which we co-deploy
with the Hystrix dashboard).

### MongoDB

  1. Deploy MongoDB

    `docker run -d -p 27017:27017 --name mongodb dockerfile/mongodb mongod`

  2. (For boot2docker only) Portforwarding for MongoDB

    `VBoxManage controlvm boot2docker-vm natpf1 "mongodb,tcp,127.0.0.1,27017,,27017"`

  3. Test this:

    `curl localhost:27017`

  Should result in:

    `It looks like you are trying to access MongoDB over HTTP on the native driver port.`
    
### ElasticSearch

  1. Deploy ElasticSearch

    `docker run -d -p 9200:9200 -p 9300:9300 dockerfile/elasticsearch`

  2. (For boot2docker only) Portforwarding for MongoDB

    `VBoxManage controlvm boot2docker-vm natpf1 "elasticsearch,tcp,127.0.0.1,9200,,9200"`

  3. Test this:

    `curl localhost:9200`

  Should result in:

    ```
    {
	  "status" : 200,
	  "name" : "Lucas Brand",
	  "cluster_name" : "elasticsearch",
	  "version" : {
	    "number" : "1.4.0",
	    "build_hash" : "bc94bd81298f81c656893ab1ddddd30a99356066",
	    "build_timestamp" : "2014-11-05T14:26:12Z",
	    "build_snapshot" : false,
	    "lucene_version" : "4.10.2"
	  },
	  "tagline" : "You Know, for Search"
	}
    ```    
    
### Netflix Eureka
  
  1. Deploy Netflix Eureka

    `docker run -i -t -p 10000:80 --name eureka riox/eureka`

   This deploys a Eureka instance in a container and exposes port 10000. Port 80 is often occupied 
so we leverge this port for dev & test environment. Docker will download the docker image
from the repo riox/eureka upon first run, then it will start the container. 
Eureka has quite a long startup time so be patient (approx. 3 min). Ensure that you setup a port forwarding rule in VirtualBox if you are using boot2docker. 

  2. (For boot2docker only) Portforwarding for Eureka

    `VBoxManage controlvm boot2docker-vm natpf1 "eureka,tcp,127.0.0.1,10000,,10000"`

  3. Test Eureka

   Point your browser to [http://localhost:10000/eureka](http://localhost:10000/eureka)

   You should see the Eureka page with only the EUREKA host itself being registered. 

  4. Optional: Test Hystrix Dashboard

   Point your browser to [http://localhost:10000/hystrix-dashboard](http://localhost:10000/hystrix-dashboard)

# Launching the micro services

Currently, we have the following services:
  1. [smartobject-service](./viotualize-service-smartobject/README.md)
  2. [catalog-service](./viotualize-service-catalog/README.md)
  3. [environment-service](./viotualize-service-environment/README.md)

Each service is packaged as a JAR file (with `mvn clean package`) and can be started as a single process. Moreover, we provide a custom Dockerfile for each microservice that spawns a Docker container and links it to both the Eureka container and the Elasticsearch container. To start the container, simply build the project, go to `target/` and run `run.sh`.

Each service may have some individual configuration that you need to be aware of, but there should be reasonable defaults to get started without touching configuration. The one config item you presumabley want to adapt is the port where the microservice is available. If you're running the standalone JAR, yous adapt `-Dserver.port` to your needs. If you're running the Docker'ized build, you can either change the port in the Maven pom.xml of the microservice:

```xml
<properties>
  <riots.port>8181</riots.port>
</properties>
```
or add the `RIOTS_PORT` variable to the environment of the container (that is, modify `run.sh` and add `-e "RIOTS_PORT=8181` to the Docker `run` command). Please consult the documentation of the individual services as linked above (all service projects have `-services` in the name of the containing folder) for special notes. 

After you started them (either via the CLI or via your favorite IDE), you should see them coming up in [Eureka](http://localhost:10000/eureka). **TODO**: We will provide a simple orchestration script to run all container on your development machine. 

Try issuing the followng POST request to create a catalog entry:

```
curl -H "Content-Type: application/json" -XPOST http://localhost:8081/api/v1/catalog/entries -d '
{
	"smartobject" : {
		"name" : "DS18B20", 
		"type" : "sensor", 
		"manufacturer" : "Maxim", 
		"tags" : [
			"thermometer", 
			"temperature"
		], 
		"description" : "dasdals", 
		"dynamic-properties" : {
			"input-voltage" : { 
				"type": "range",
				"min" : 3,
				"max" : 5,
				"unit" : "V"			
			},
			"resolution" : { 
				"type": "range",
				"min" : 9,
				"max" : 12, 
				"unit" : "bit" 				
			}, 
			"temperature" : { 
				"type": "range",
				"min" : -55,
				"max" : 125, 
				"unit" : "C" 				
			}
		}
	}, 
	"image-url" : "images/maxim-ds18b20.jpeg", 
	"product-url" : "http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18B20.html", 
	"creator" : "riox", 
	"visibility" : "public", 
	"creation-time" : "2014-08-12T22:14 UTC", 
	"last-update-time" : "2014-08-15T22:14 UTC", 
	"rating" : 4, 
	"collaborators" : [
		"olmoser", 
		"enz", 
		"whummer"
	], 
	"comments" : [
		{
			"creation-time" : "2014-08-15T22:14 UTC", 
			"comment" : "this device is great for very humid areas", 
			"rating" : 4
		}
	], 
	"version" : "1.0", 
	"cost" : {
		"currency" : "USD", 
		"amount" : "134"
	}
}'

```
