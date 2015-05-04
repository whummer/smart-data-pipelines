#!/bin/bash

while [[ $# > 0 ]]
do
	key="$1"
	case $key in
	    -t|--tag)
	    TAG="$2"
	    shift
	    ;;
	    -p|--push)
	    PUSH_IMAGE="true"
	    shift
	    ;;   
	    *)
	    # unknown option
	    ;;
	esac
	shift
done

# set default tag
if  [ -z $TAG ]; then
	TAG="latest"
fi
if [ ! -d $TAG ]; then
	echo "Directory $TAG does not exist!"
	exit 1
fi
echo "Using tag: $TAG"


IMAGE="riox/nodejs"

(cd $TAG && docker build -t $IMAGE:$VERSION .)
if [ ! -z $PUSH_IMAGE ]; then
	docker push $IMAGE:$VERSION
fi
