#!/bin/bash

: ${KAFKA_BROKER_ID:=$RANDOM}
: ${KAFKA_ZOOKEEPER_CONNECT:=zookeeper.${POD_NAMESPACE}.svc.cluster.local:2181}
: ${KAFKA_ADVERTISED_HOST:=${KAFKA_PORT_9092_TCP_ADDR}}
: ${KAFKA_ADVERTISED_PORT:=${KAFKA_PORT_9092_TCP_PORT}}
: ${KAFKA_LOG_CLEANER:=true}
: ${KAFKA_AUTO_CREATE_TOPICS:=true}
: ${KAFKA_ENABLE_DELETE_TOPICS:=true}

echo "KAFKA_BROKER_ID: ${KAFKA_BROKER_ID}"
echo "KAFKA_ZOOKEEPER_CONNECT: ${KAFKA_ZOOKEEPER_CONNECT}"
echo "KAFKA_ADVERTISED_HOST: ${KAFKA_ADVERTISED_HOST}"
echo "KAFKA_ADVERTISED_PORT: ${KAFKA_ADVERTISED_PORT}"
echo "KAFKA_LOG_CLEANER: ${KAFKA_LOG_CLEANER}"
echo "KAFKA_AUTO_CREATE_TOPICS: ${KAFKA_AUTO_CREATE_TOPICS}"
echo "KAFKA_ENABLE_DELETE_TOPICS: ${KAFKA_ENABLE_DELETE_TOPICS}"


KAFKA_CONFIG=${KAFKA_HOME}/config/server.properties

if [[ -n ${KAFKA_BROKER_ID} ]]; then
  sed -e "s/broker.id=.*/broker.id=${KAFKA_BROKER_ID}/" \
    -i $KAFKA_CONFIG
fi

if [[ -n ${KAFKA_ZOOKEEPER_CONNECT} ]]; then
  sed -e "s/^zookeeper.connect=.*/zookeeper.connect=${KAFKA_ZOOKEEPER_CONNECT}/" \
    -i $KAFKA_CONFIG
fi

if [[ -n ${KAFKA_ADVERTISED_HOST} ]]; then
  sed -e "s/^#advertised.host.name=.*/advertised.host.name=${KAFKA_ADVERTISED_HOST}/" \
    -i $KAFKA_CONFIG
fi

if [[ -n ${KAFKA_ADVERTISED_PORT} ]]; then
  sed -e "s/^#advertised.port=.*/advertised.port=${KAFKA_ADVERTISED_PORT}/" \
    -i $KAFKA_CONFIG
fi

if [[ -n ${KAFKA_LOG_CLEANER} ]]; then
  sed -e "s/^log.cleaner.enable=.*/log.cleaner.enable=${KAFKA_LOG_CLEANER}/" \
    -i $KAFKA_CONFIG
fi

sed -e 's|^log.dirs=.*|log.dirs=/data|' -i $KAFKA_CONFIG
echo "auto.create.topics.enable=${KAFKA_AUTO_CREATE_TOPICS}" >> $KAFKA_CONFIG

echo "delete.topic.enable=${KAFKA_ENABLE_DELETE_TOPICS}" >> $KAFKA_CONFIG

if [[ $# -lt 1 ]] || [[ "$1" == "--"* ]]; then
  exec ${KAFKA_HOME}/bin/kafka-server-start.sh $KAFKA_CONFIG "$@"
fi

exec "$@"
