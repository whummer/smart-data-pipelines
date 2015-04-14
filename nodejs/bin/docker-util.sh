#!/bin/bash

IMAGE_NAME=""
BASEDIR=$(dirname $0)

VERBOSE=0
NO_PUSH=0
PRETEND=0

while true; do
  case "$1" in
    -v | --verbose ) VERBOSE=1; shift ;;
    -x | --no-push ) NO_PUSH=1; shift ;;
    -p | --pretend ) PRETEND=1; shift ;;
    -b | --basedir ) BASEDIR="$2"; shift 2 ;;
    -i | --image-name ) IMAGE_NAME="$2"; shift 2 ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

DOCKER_CMD="docker build -t ${IMAGE_NAME} ${BASEDIR}"

if [ "$PRETEND" -eq "1" ]; then
  echo "$DOCKER_CMD";
  exit;
fi

`$DOCKER_CMD`

if [ "$NO_PUSH" -eq "1" ]; then
	echo "*** NOT pushing image to Docker registry ***";
	exit;
fi

docker push ${IMAGE_NAME}
