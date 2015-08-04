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

(cd $BASEDIR/../../ && make rolling-update)

sleep 15

echo "Running selenium tests"
if [ -e "/usr/bin/xvfb-run" ]; then
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && xvfb-run mvn -Driox.endpoint="http://demo.riox.io" test)
else
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && mvn -Driox.endpoint="http://demo.riox.io" test)
fi
