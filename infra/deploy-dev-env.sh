#!/bin/bash

BASEDIR=$(dirname $0)

MODE="create"
MODE_TEXT="Creating"

while [[ $# > 0 ]]
do
	key="$1"
	case $key in	    
	    -u|--update)
	    MODE="update"
	    MODE_TEXT="Updating"
	    shift
	    ;;   
	    *)
	    # unknown option
	    echo "Usage: deploy-dev-env.sh [-h] [-u | --update]"
	    echo "          -h              Displays help"
	    echo "          -u | --update   Update resources instead of create (they need to exist already)"
	    exit 1
	    ;;
	esac
	shift
done

echo "${MODE_TEXT} Zookeeper..."
kubectl $MODE -f ${BASEDIR}/spring-xd-zookeeper/zookeeper-controller.yml
kubectl $MODE -f ${BASEDIR}/spring-xd-zookeeper/zookeeper-service.yml

echo "${MODE_TEXT} Redis..."
kubectl resize rc redis --replicas=0
kubectl $MODE -f ${BASEDIR}/redis/redis-controller.yml
kubectl $MODE -f ${BASEDIR}/redis/redis-service.yml

echo "${MODE_TEXT} Kafka ..."
kubectl $MODE -f ${BASEDIR}/kafka/kafka-controller.yml
kubectl $MODE -f ${BASEDIR}/kafka/kafka-service.yml

echo "${MODE_TEXT} HSQLDB..."
kubectl $MODE -f ${BASEDIR}/spring-xd-hsqldb/hsqldb-controller.yml
kubectl $MODE -f ${BASEDIR}/spring-xd-hsqldb/hsqldb-service.yml

echo "${MODE_TEXT} Spring XD Admin..."
kubectl $MODE -f ${BASEDIR}/spring-xd-admin/xd-admin-controller.yml
kubectl $MODE -f ${BASEDIR}/spring-xd-admin/xd-admin-service.yml

echo "${MODE_TEXT} Spring XD Containers..."
kubectl $MODE -f ${BASEDIR}/spring-xd-container/xd-container-controller.yml
kubectl $MODE -f ${BASEDIR}/spring-xd-container/xd-container-inbound-service.yml
kubectl $MODE -f ${BASEDIR}/spring-xd-container/xd-container-outbound-service.yml

echo "${MODE_TEXT} Mongo Containers..."
kubectl $MODE -f ${BASEDIR}/mongodb/mongodb-controller.yml
kubectl $MODE -f ${BASEDIR}/mongodb/mongodb-service.yml