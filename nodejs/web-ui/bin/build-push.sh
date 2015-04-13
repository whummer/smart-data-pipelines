#!/bin/bash

IMAGE_NAME=quay.io/riox/webui
BASEDIR=$(dirname $0)

docker build -t ${IMAGE_NAME} ${BASEDIR}/../
if [ "$1" == "--no-push" ]; then
	echo "*** NOT pushing image to Docker registry ***";
	exit;
fi

docker push ${IMAGE_NAME}
