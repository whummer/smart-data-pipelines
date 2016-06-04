#!/bin/bash

REALPATH=`realpath $0 2> /dev/null`
if [ "$REALPATH" == "" ]; then
	REALPATH=$0
fi
BASEDIR=`dirname $REALPATH`

# ATTENTION this kills ALL docker containers
docker rm -f $(docker ps -aq)

$BASEDIR/rioxStartAll.sh
