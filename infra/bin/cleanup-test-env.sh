#!/bin/bash

BASEDIR=`dirname $0`

export RIOX_ENV=test

# Cleans up all resources on the cloud
function cleanup () {
  echo "Cleaning up environment $RIOX_ENV"
  (cd $BASEDIR/../ && make undeploy-services)
  (cd $BASEDIR/../../ && make undeploy-services)
  #kill -KILL $$
}

cleanup
