#!/bin/bash

IMAGE_NAME=quay.io/riox/webui
BASEDIR=$(dirname $0) 

docker build -t ${IMAGE_NAME} ${BASEDIR}/../
#docker push ${IMAGE_NAME}
