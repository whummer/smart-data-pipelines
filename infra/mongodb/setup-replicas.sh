#!/usr/bin/env bash

#
# this script handles replica set creation for our mongo cluster. It does the following:
# * initialize the replica set via `rs.initiate()`
# * collect the IP addresses of the mongo PODs that were created by the mongo replication controller
# * add the list of IP addresses to the replica set config
#
MONGO_PRIMARY=mongo-1
DOMAIN=development.svc.cluster.local
MONGO_DNS_NAME="${MONGO_PRIMARY}.${DOMAIN}"
MONGO_SERVICE_IP=$(dig +short ${MONGO_DNS_NAME})
REPLICA_MAX_ID=3
#echo -e "rs.initiate()" | mongo $MONGO_SERVICE_IP # todo this is a workaround for poor omoser since something is fubar 

MONGO_CONFIG="rs.initiate();"
for REPLICA_ID in `seq 2 $REPLICA_MAX_ID`; do
	MONGO_CONFIG="$MONGO_CONFIG; rs.add('mongo-${REPLICA_ID}.${DOMAIN}:27017');";
done

MONGO_CONFIG="$MONGO_CONFIG; var newconf = rs.conf(); newconf.members[0].host = 'mongo-1.development.svc.cluster.local:27017'; rs.reconfig(newconf);";
echo -e "$MONGO_CONFIG" | mongo $MONGO_SERVICE_IP

#echo -e "rs.add('${MONGO_SECONDARY_1}:27017'); rs.add('${MONGO_SECONDARY_2}:27017');var newconf = rs.conf(); newconf.members[0].host = 'mongo-1.development.svc.cluster.local:27017'; rs.reconfig(newconf);" | mongo $MONGO_SERVICE_IP
