#!/bin/bash

set -ex

BASEDIR=$(dirname $0) 

# Build all docker images
docker build -t riots/service-catalog $BASEDIR/riots-service-catalog/target/
docker build -t riots/service-environment $BASEDIR/riots-service-environment/target/
docker build -t riots/service-simulation $BASEDIR/riots-service-simulation/target/
docker build -t riots/service-users $BASEDIR/riots-service-users/target/
docker build -t riots/service-gateway $BASEDIR/riots-service-gateway/target/
docker build -t riots/service-files $BASEDIR/riots-service-files/target/
docker build -t riots/webapp $BASEDIR/riots-webapp/target/
