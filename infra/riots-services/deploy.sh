#!/bin/bash

source $(dirname $0)/../helpers.sh

# Deploy replication controller 
render_template $1 > /tmp/$(basename $1)
$GKE replicationcontrollers create --config-file /tmp/$(basename $1)
