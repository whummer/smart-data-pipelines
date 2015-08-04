#!/bin/bash

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
SQUASH_BIN=`which docker-squash`
IMAGE_TAG_SRC=riox/hyperriox:latest
IMAGE_TAG_DST=riox/hyperriox

if [ "$SQUASH_BIN" == "" ]; then
	echo "ERROR: Please install docker-squash binary"
	exit 1
fi

docker save $IMAGE_TAG_SRC | sudo $SQUASH_BIN -t $IMAGE_TAG_DST -verbose | docker load

#TMP_IMAGE=/tmp/hyperriox.image.tar
#TMP_SQUASHED=/tmp/hyperriox.squashed.tar
#echo "Saving"
#docker save $IMAGE_TAG_SRC > $TMP_IMAGE
#echo "Squashing"
#sudo $SQUASH_BIN -i $TMP_IMAGE -o $TMP_SQUASHED -t $IMAGE_TAG_DST
#echo "Loading"
#cat $TMP_SQUASHED | docker load
