#!/bin/bash

docker rm -f $(docker ps -aq)
(
cd ~/eclipse/riox/
(cd infra/ && make deploy-k8s)

code=
while [ "$code" != "0" ]; do
	kubectl get nodes | grep Ready
	code=$?
	echo "Waiting for k8s"
	sleep 2
done

(cd infra/ && make init-cluster)
(cd infra/ && make deploy-k8s-dns)
sleep 2
(cd infra/ && make deploy-services)

code=
while [ "$code" != "0" ]; do
	echo "Waiting for DNS"
	dig @10.0.0.100 mongo.dev.riox.internal | grep ANSWER
	code=$?
        sleep 3
done

#( cd nodejs && gulp riox) &

)

#( cd ~/eclipse/riox/nodejs/gateway && sudo ./bin/rgw -f config/config.json )
