# Riox Developer Guide


## Prerequisites

* Node JS 0.12.x
* Docker v1.6.0 (it is important to have this version)
* [docker-compose](https://docs.docker.com/compose/install/) - for setting up requires systems for development 
  (Spring XD, RabbitMQ, etc)


## Setup development dependencies

Setup all docker containers (this may take a while, esp. the first time when all containers have to be downloaded):
```
$ docker-compose -f riox-dev-env.yml up -d
```

If you run on Mac OS with boot2docker, run the following command once:

```
$ ./bin/boot2docker-rules.sh
```

If you want to see the logs for the infrastructure, just run this:
```
$ docker-compose -f riox-dev-env.yml logs
```


# Build the code

TBD

# Run the code

TBD
 

# Run the tests

Build a test image with the following command (This process needs to be improved in terms of speed as discussed in [Issue 190](https://github.com/riox/riox/issues/190)): 
```
$ ./bin/build-e2e-image.sh 
```

Execute all the integration tests
```
$ ./bin/run-e2e-tests.sh [--no-timeouts]
```

You should see them passing. If you get a timeout error, re-run the command with the `--no-timeouts` arguments. 
If this does also not help, please file an issue.

