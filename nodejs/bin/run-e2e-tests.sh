#!/bin/bash

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
	    shift
	    ;;   
	    *)
	    # unknown option
	    ;;
	esac
	shift
done

ARGS=""

if [ ! -z "$TIMEOUT" ]; then
	ARGS="--timeout "$TIMEOUT
fi

if [ ! -z "$NO_TIMEOUT" ]; then
	ARGS="--no-timeouts"
fi


docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock riox/riox-tests bash -c "cd services && mocha $ARGS"