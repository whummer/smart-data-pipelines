#!/bin/bash

source $(dirname $0)/../helpers.sh

# Deploy replication controller 
render_template ${BASEDIR}/elasticsearch-controller.json > /tmp/elasticsearch-controller.json
$GKE replicationcontrollers create --config-file /tmp/elasticsearch-controller.json # THIS DID NOT WORK <(render_template elasticsearch-controller.json)

# Deploy service
render_template ${BASEDIR}/elasticsearch-service.json > /tmp/elasticsearch-service.json
$GKE services create --config-file /tmp/elasticsearch-service.json