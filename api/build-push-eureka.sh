#!/bin/bash

set -ex

BASEDIR=$(dirname $0) 

# Build all docker images
docker build -t riots/service-eureka $BASEDIR/riots-service-registry/
