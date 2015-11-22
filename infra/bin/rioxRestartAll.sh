#!/bin/bash

REALPATH=`realpath $0`
if [ "$REALPATH" == "" ]; then
	REALPATH=$0
fi
BASEDIR=`dirname $REALPATH`

export RIOX_ENV=development

kubectl_output=`kubectl config view | grep current-context:`
if [[ "$kubectl_output" =~ "aws_kubernetes" ]]; then
	echo "==== ATTENTION =========== "
	echo "Looks like kubectl is pointing to AWS!"
	echo "========================== "
	while [ -z "$CONTINUE" ]; do
		read -r -p "Shall I run: kubectl config use-context dev [y/n]: " CONTINUE;
	done
	if [[ "$CONTINUE" != "y" ]]; then
		echo "Exiting."
		exit 1
	fi
	kubectl config use-context dev
fi

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
(cd  $BASEDIR/../ && make deploy-services-dev)

code=
while [ "$code" != "0" ]; do
	echo "Waiting for DNS"
	dig @10.0.0.100 mongo.development.svc.cluster.local | grep ANSWER
	code=$?
	sleep 3
done

#( cd nodejs && gulp riox) &

#( cd ~/eclipse/riox/gateway && sudo ./bin/rgw -f config/config.json )
