#!/bin/bash

source $(dirname $0)/../helpers.sh


#render_template ${BASEDIR}/files-controller.json 

# Deploy replication controller 
#render_template ${BASEDIR}/activemq-controller.json > /tmp/activemq-controller.json
$GKE replicationcontrollers create --config-file $1
