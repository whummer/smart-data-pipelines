#!/bin/bash

source $(dirname $0)/../helpers.sh

# Deploy replication controller 
render_template ${BASEDIR}/mongodb-controller.json > /tmp/mongodb-controller.json
$GKE replicationcontrollers create --config-file /tmp/mongodb-controller.json # THIS DID NOT WORK <(render_template mongodb-controller.json)

# Deploy service
render_template ${BASEDIR}/mongodb-service.json > /tmp/mongodb-service.json
$GKE services create --config-file /tmp/mongodb-service.json