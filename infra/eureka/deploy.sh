#!/bin/bash

source $(dirname $0)/../helpers.sh

# Deploy replication controller 
render_template ${BASEDIR}/eureka-controller.json > /tmp/eureka-controller.json
$GKE replicationcontrollers create --config-file /tmp/eureka-controller.json # THIS DID NOT WORK <(render_template activemq-controller.json)

# Deploy service
render_template ${BASEDIR}/eureka-service.json > /tmp/eureka-service.json
$GKE services create --config-file /tmp/eureka-service.json