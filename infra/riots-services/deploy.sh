#!/bin/bash

source $(dirname $0)/../helpers.sh

deploy_controller() {
	echo "Deploying replication controller $1"
	render_template $1 > /tmp/$(basename $1)
	$GKE replicationcontrollers create --config-file /tmp/$(basename $1)
}

if [ "$1" == "all" ];
then
	files=`ls *.json`
	echo "Deploying all services..."
	echo ""
	for f in $files
	do
		deploy_controller $f
	done
else
	deploy_controller $1
fi


