#!/bin/bash

##
# This script check if the GIT tag matches the Docker image
# and proceeds with an "unsupervised" rolling upgrade into staging.
##

: ${GIT_TAG?"Need to set GIT_TAG"}

BASEDIR=`dirname $0`

export RIOX_ENV=staging
export IMAGE_VERSION=`git rev-list ${GIT_TAG} | head -n 1`

# TODO validate that image version exists in docker registry

(cd $BASEDIR/../../nodejs/ && make rolling-update)

# TODO: this is a temp hack for the timing fix
kubectl --namespace=staging scale rc streams-service --replicas=0
kubectl --namespace=staging scale rc streams-service --replicas=2
