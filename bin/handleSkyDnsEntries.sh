#!/bin/bash

HOST_IP=127.0.0.1
SKYDNS_URL=http://localhost:4001/v2/keys/skydns

CMD=
if [ "$1" == "insert" ]; then
	CMD=PUT
elif [ "$1" == "remove" ]; then
	CMD=DELETE
else 
	echo "Usage: $0 (insert | remove)"
	exit 1
fi

for svc in \
	access-service \
	certificates-service \
	files-service \
	gateway-service \
	nginx-config \
	notifications-service \
	organizations-service \
	pipes-service \
	pricing-service \
	proxies-service \
	ratings-service \
	riox-ui \
	statistics-service \
	users-service; \

	do

	curl $SKYDNS_URL/local/cluster/svc/development/$svc/12345 -X$CMD -d value="{\"host\":\"$HOST_IP\", \"priority\":999}"

done
