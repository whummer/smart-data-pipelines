#!/bin/bash

source $(dirname $0)/../helpers.sh

# Deploy replication controller 
render_template ${BASEDIR}/docker-registry-controller.json > /tmp/docker-registry-controller.json
$GKE replicationcontrollers create --config-file /tmp/docker-registry-controller.json 

# Deploy service
render_template ${BASEDIR}/docker-registry-service.json > /tmp/docker-registry-service.json
$GKE services create --config-file /tmp/docker-registry-service.json