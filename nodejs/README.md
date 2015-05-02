# Riox Developer Guide


## Prerequisites

* Node JS 0.12.x
* Docker v1.6.0
* [docker-compose](https://docs.docker.com/compose/install/) - for setting up requires systems for development 
  (Spring XD, RabbitMQ, etc)
   
   

## Setup development dependencies


Setup all docker containers (this may take a while, esp. the first time when all containers have to be downloaded):
```
$ docker-compose -f riox-dev-env.yml up 
```

Configure RabbitMQ vhost and permission:

```
$ ./bin/config-rabbitmq.sh 
```


If you run on Mac OS with boot2docker, run the following command once:

```
$ ./bin/boot2docker-rules.sh
```


# Build the code

TBD

# Run the code

TBD
 



