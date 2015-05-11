#!/bin/bash

source $(dirname $0)/../helpers.sh

# Deploy replication controller 
render_template ${BASEDIR}/activemq-controller.json > /tmp/activemq-controller.json
$GKE replicationcontrollers create --config-file /tmp/activemq-controller.json # THIS DID NOT WORK <(render_template activemq-controller.json)

# Deploy service
render_template ${BASEDIR}/activemq-service.json > /tmp/activemq-service.json
$GKE services create --config-file /tmp/activemq-service.json