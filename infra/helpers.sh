#!/bin/bash

[ -z ${RIOTS_ENV} ] && { echo "RIOTS_ENV is not defined." ; exit 1; }

BASEDIR=$(dirname $0) 
GKE="gcloud preview container"
DOCKER_REGISTRY=""

# render a template configuration file
# expand variables + preserve formatting
render_template() {
 eval "cat <<EOF
$(<$1)
EOF
" 2> /dev/null
}

delete_controller() {
	$GKE replicationcontrollers delete $1
}

resize_controller() {
	$GKE replicationcontrollers resize $1 --num-replicas $2
}

delete_service() {
	$GKE services delete $1
}