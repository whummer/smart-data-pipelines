#!/bin/bash

REALPATH=`realpath $0`
if [ "$REALPATH" == "" ]; then
	REALPATH=$0
fi
BASEDIR=`dirname $REALPATH`

docker rm -f $(docker ps -aq)

(cd  $BASEDIR/../ && make deploy-k8s)

code=
while [ "$code" != "0" ]; do
	kubectl get nodes | grep Ready
	code=$?
	echo "Waiting for k8s"
	sleep 2
done

(cd $BASEDIR/../ && make init-cluster)
(cd  $BASEDIR/../ && make deploy-k8s-dns)
sleep 2
(cd  $BASEDIR/../ && make deploy-services)

code=
while [ "$code" != "0" ]; do
	echo "Waiting for DNS"
	dig @10.0.0.100 mongo.dev.riox.internal | grep ANSWER
	code=$?
	sleep 3
done

#( cd nodejs && gulp riox) &

#( cd ~/eclipse/riox/nodejs/gateway && sudo ./bin/rgw -f config/config.json )
