#!/bin/bash

set -ex

BASEDIR=$(dirname $0) 
DOCKER_REGISTRY=10.131.245.157:5000

# Build all docker images
docker build -t riots/service-eureka $BASEDIR/riots-service-registry/
docker tag -f riots/service-eureka ${DOCKER_REGISTRY}/riots/service-eureka
docker push ${DOCKER_REGISTRY}/riots/service-eureka