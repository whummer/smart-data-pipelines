#!/bin/bash

source $(dirname $0)/../helpers.sh

# if [ "$1" == "all" ];
# then
# 	files=`ls *.json`
# 	echo "Deploying all services..."
# 	echo ""
# 	for f in $files
# 	do
# 		deploy_controller $f
# 	done
# else
# 	deploy_controller $1
# fi


for ctrl in "${CONTROLLERS[@]}"
do
	deploy_controller "${ctrl}-controller.json"
done
