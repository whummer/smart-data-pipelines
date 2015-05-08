#!/bin/bash

ARGS=""

while [[ $# > 0 ]]
do
	key="$1"
	case $key in
	    --timeout)
	    TIMEOUT="$2"
	    shift
	    ;;
	    --no-timeouts)
	    NO_TIMEOUT="true"
	    ;;
	    *)
	    # unknown option
	    ARGS=$ARGS" "$1
	    ;;
	esac
	shift
done

if [ ! -z "$TIMEOUT" ]; then
	ARGS="--timeout "$TIMEOUT" "$ARGS
fi

if [ ! -z "$NO_TIMEOUT" ]; then
	ARGS="--no-timeouts "$ARGS
fi

#docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock riox/riox-tests bash -c "cd services && mocha $ARGS"
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock -v `pwd`:/code riox/nodejs-base bash -c "cd services && NODE_PATH=/usr/local/lib/node_modules/ mocha $ARGS"

