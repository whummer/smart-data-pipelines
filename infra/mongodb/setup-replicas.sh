#!/usr/bin/env bash

#
# this script handles replica set creation for our mongo cluster. It does the following:
# * initialize the replica set via `rs.initiate()`
# * collect the IP addresses of the mongo PODs that were created by the mongo replication controller
# * add the list of IP addresses to the replica set config
#

MONGO_SERVICE_IP=$(dig +short mongo.dev.svc.cluster.local)
echo -e "rs.initiate()" | mongo $MONGO_SERVICE_IP # todo this is a workaround for poor omoser since something is fubar 

MONGO_IPS=`docker inspect $(docker ps | grep mongo | grep POD | awk '{print $1}') | grep IPA | grep -vi secondary | cut -d ':' -f2 | cut -d '"' -f2`
for IP in $MONGO_IPS; do
	echo "Adding $IP to mongo replica set";
	echo -e "rs.add('$IP:27017')" | mongo $MONGO_SERVICE_IP
done
