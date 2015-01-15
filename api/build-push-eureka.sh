#!/bin/bash

set -ex

BASEDIR=$(dirname $0) 
DOCKER_REGISTRY="10.240.183.174:5000"

(cd riots-service-registry && mvn clean install)

# Build all docker images
docker build -t riots/service-eureka $BASEDIR/riots-service-registry/target
docker tag -f riots/service-eureka ${DOCKER_REGISTRY}/riots/service-eureka
docker push ${DOCKER_REGISTRY}/riots/service-eureka