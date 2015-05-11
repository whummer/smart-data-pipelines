#!/bin/bash

[ -z ${RIOTS_ENV} ] && { echo "RIOTS_ENV is not defined." ; exit 1; }
[ -z ${IMAGE_TAG} ] && { echo "IMAGE_TAG is not defined." ; exit 1; }

BASEDIR=$(dirname $0) 
GKE="gcloud preview container"

DOCKER_REGISTRY="10.240.183.174:5000"
EUREKA_HOSTNAME="10.27.252.98"
ELASTICSEARCH_HOSTNAME="10.27.247.201"
MONGODB_HOSTNAME="10.27.240.39"
ACTIVEMQ_HOSTNAME="10.27.254.163"

declare -a CONTROLLERS=("riots-catalog"\
					    "riots-environment"\
					    "riots-simulation"\
					    "riots-users"\
					    "riots-gateway"\
					    "riots-files"\
					    "riots-docs"\
				        "riots-webapp")

# render a template configuration file
# expand variables + preserve formatting
render_template() {
 eval "cat <<EOF
$(<$1)
EOF
" 2> /dev/null
}


deploy_controller() {
	echo "Deploying replication controller $1"
	render_template $BASEDIR/$1 > /tmp/$(basename $1)
	$GKE replicationcontrollers create --config-file /tmp/$(basename $1)
}

delete_controller() {
	$GKE replicationcontrollers delete $1
}

resize_controller() {
	$GKE replicationcontrollers resize $1 --num-replicas $2
}

deploy_service() {
	echo "Deploying service $1"
	render_template $1 > /tmp/$(basename $1)
	$GKE services create --config-file /tmp/$(basename $1)
}

delete_service() {
	$GKE services delete $1
}

