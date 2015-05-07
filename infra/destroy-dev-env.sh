#!/bin/bash

BASEDIR=$(dirname $0)

echo "Destroying Zookeeper..."
kubectl resize rc zookeeper --replicas=0
kubectl delete -f ${BASEDIR}/spring-xd-zookeeper/zookeeper-controller.yml
kubectl delete -f ${BASEDIR}/spring-xd-zookeeper/zookeeper-service.yml

echo "Destroying Redis..."
kubectl resize rc redis --replicas=0
kubectl delete -f ${BASEDIR}/redis/redis-controller.yml
kubectl delete -f ${BASEDIR}/redis/redis-service.yml


echo "Destroying Kafka ..."
kubectl resize rc kafka --replicas=0
kubectl delete -f ${BASEDIR}/kafka/kafka-controller.yml
kubectl delete -f ${BASEDIR}/kafka/kafka-service.yml

echo "Destroying HSQLDB..."
kubectl resize rc hsqldb --replicas=0
kubectl delete -f ${BASEDIR}/spring-xd-hsqldb/hsqldb-controller.yml
kubectl delete -f ${BASEDIR}/spring-xd-hsqldb/hsqldb-service.yml

echo "Destroying Spring XD Admin..."
kubectl resize rc xd-admin --replicas=0
kubectl delete -f ${BASEDIR}/spring-xd-admin/xd-admin-controller.yml
kubectl delete -f ${BASEDIR}/spring-xd-admin/xd-admin-service.yml

echo "Destroying Spring XD Containers..."
kubectl resize rc xd-container --replicas=0
kubectl delete -f ${BASEDIR}/spring-xd-container/xd-container-controller.yml
kubectl delete -f ${BASEDIR}/spring-xd-container/xd-container-inbound-service.yml
kubectl delete -f ${BASEDIR}/spring-xd-container/xd-container-outbound-service.yml

echo "Destroying Mongo Containers..."
kubectl resize rc mongo --replicas=0
kubectl delete -f ${BASEDIR}/mongodb/mongodb-controller.yml
kubectl delete -f ${BASEDIR}/mongodb/mongodb-service.yml