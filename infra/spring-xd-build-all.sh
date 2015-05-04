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
	    -h|--help)
			echo "Usage: ./spring-xd-make.sh [-t tag (default: 1.1.1)] [--push ]"
			;;
	    *)
	    # unknown option
	    ;;
	esac
	shift
done

MAKE_ARGS=""
if [ ! -z $TAG ]; then
	MAKE_ARGS="-t "$TAG
fi


if [ ! -z $PUSH_IMAGE ]; then
	MAKE_ARGS=$MAKE_ARGS" -p"
fi

(cd ./spring-xd-base && ./make.sh $MAKE_ARGS)
(cd ./spring-xd-admin && ./make.sh $MAKE_ARGS)
(cd ./spring-xd-container && ./make.sh $MAKE_ARGS)
(cd ./spring-xd-hsqldb && ./make.sh $MAKE_ARGS)
(cd ./spring-xd-shell && ./make.sh $MAKE_ARGS)
(cd ./spring-xd-zookeeper && ./make.sh $MAKE_ARGS)