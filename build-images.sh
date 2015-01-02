#!/bin/bash

set -ex

BASEDIR=$(dirname $0) 
echo $BASEDIR

# Build all docker images
docker build -t riots/service-catalog ./riots-service-catalog/target/
docker build -t riots/service-environment riots-service-environment/target/
docker build -t riots/service-gateway riots-service-gateway/target/
docker build -t riots/service-simulation riots-service-simulation/target/
docker build -t riots/service-users riots-service-users/target/
docker build -t riots/webapp riots-webapp/target/