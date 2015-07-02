#!/usr/bin/env bash

red=`tput setaf 1`
green=`tput setaf 2`
yellow=`tput setaf 3`
reset=`tput sgr0`

VERBOSE=0
CHECK=0
RESTART=0
START=0
KILL=0
XD_ENABLED=0

#
# collect CLI args
#
while true; do
  case "$1" in
    -v | --verbose ) VERBOSE=1; shift ;;
    -r | --restart ) RESTART=1; shift ;;
    -s | --start) START=1; shift ;;
    -k | --kill) KILL=1; shift ;;
    -c | --check) CHECK=1; shift ;;
    -x | --xd-enabled) XD_ENABLED=1; shift ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

XD_CONTAINER=$(which xd-container)
ZK=$(which zkServer)
REDIS=$(which redis-server)
KAFKA=$(which kafka-server-start.sh)
KAFKA_STOP=$(which kafka-server-stop.sh)
HSQL=$(which hsqldb-server)
XD_CONTAINER=$(which xd-container)
XD_ADMIN=$(which xd-admin)

KAFKA_CONFIGFILE=/opt/boxen/homebrew/etc/kafka/server.properties

#
# override XD settings 
#
export HSQL_SERVER_HOST=localhost
export HSQL_SERVER_PORT=9101
export ZK_CLIENT_CONNECT=localhost:2181
export SPRING_REDIS_HOST=localhost
export SPRING_REDIS_PORT=6379
export XD_TRANSPORT=kafka
export XD_MESSAGEBUS_KAFKA_BROKERS=localhost:9092
export XD_MESSAGEBUS_KAFKA_ZKADDRESS=localhost:2181

if [ "$VERBOSE" == 1 ]; then 
	echo "HSQL_SERVER_HOST: ${HSQL_SERVER_HOST}"
	echo "HSQL_SERVER_PORT: ${HSQL_SERVER_PORT}"
	echo "ZK_CLIENT_CONNECT: ${ZK_CLIENT_CONNECT}"
	echo "SPRING_REDIS_HOST: ${SPRING_REDIS_HOST}"
	echo "SPRING_REDIS_PORT: ${SPRING_REDIS_PORT}"
	if [ "$XD_ENABLED" -ne "" ]; then
		echo "XD_MESSAGEBUS_KAFKA_BROKERS: ${XD_MESSAGEBUS_KAFKA_BROKERS}"
		echo "XD_MESSAGEBUS_KAFKA_ZKADDRESS: ${XD_MESSAGEBUS_KAFKA_ZKADDRESS}"
	fi
fi

#
# zookeeper
#
function start_zookeeper() {
	if [ "$ZK" == "" ]; then
		printf "${red}No local Zookeeper installation found.${reset}\n"
	else
		printf "${green}Found Zookeeper startup script: ${ZK}${reset}\n"
		out=$($ZK start)
		started=$(echo $out | grep STARTED)
		if [ -z "$started" ]; then
			printf "${red}Could not start Zookeeper: $out${reset}\n"
			exit -1
		else
			printf "${green}Zookeeper started successfully${reset}\n"
		fi
	fi
}

#
# redis
#
function start_redis() {
	if [ "$REDIS" == "" ]; then
		printf "${red}No local REDIS installation found.${reset}\n"
	else
		printf "${green}Found REDIS startup script: ${REDIS}${reset}\n"
		nohup $REDIS 2>&1 > /tmp/redis.log &
		retries=0
		while true; do
			started=$(grep started /tmp/redis.log)
			if [ -z "$started" ]; then
				if [ "$retries" -gt 3 ]; then
					printf "${red}Could not start Redis:${reset}\n"
					cat /tmp/redis.log
					exit -1
				else 
					((retries++))
					sleep 1
				fi
			else
				printf "${green}Redis started successfully${reset}\n"
				break
			fi
		done
	fi
}

#
# kafka
#
function start_kafka() {
	if [ "$KAFKA" == "" ]; then
		printf "${red}No local Kafka installation found.${reset}\n"
	else
		printf "${green}Found Kafka startup script: ${KAFKA}${reset}\n"
		if [ ! -e $KAFKA_CONFIGFILE ]; then
			printf "${red}Cannot file Kafka config (located at ${KAFKA_CONFIGFILE})${reset}\n"
			exit 0
		fi

		nohup $KAFKA $KAFKA_CONFIGFILE 2>&1 > /tmp/kafka.log &
		retries=0
		while true; do
			started=$(cat /tmp/kafka.log | grep kafka.server.KafkaServer | grep started)
			if [ -z "$started" ]; then
				if [ "$retries" -gt 3 ]; then
					printf "${red}Could not start Kafka:${reset}\n"
					cat /tmp/kafka.log
					exit -1
				else 
					((retries++))
					sleep 1
				fi
			else
				printf "${green}Kafka started successfully${reset}\n"
				break
			fi
		done
	fi
}

#
# hsql 
#
function start_hsql() {
	if [ "$HSQL" == "" ]; then
		printf "${red}No local HSQL installation found.${reset}\n"
	else
		printf "${green}Found HSQL startup script: ${HSQL}${reset}\n"
		nohup $HSQL 2>&1 > /tmp/hsql.log &
		retries=0
		while true; do
			started=$(cat /tmp/hsql.log | grep "Started HSQL Server")
			if [ -z "$started" ]; then
				if [ "$retries" -gt 3 ]; then
					printf "${red}Could not start HSQL: ${reset}\n"
					cat /tmp/hsql.log
					exit -1
				else
					((retries++))
					sleep 1
				fi
			else
				printf "${green}HSQL started successfully${reset}\n"
				break
			fi
		done
	fi
}

#
# finally springxd
#
function start_xd_admin() {
	if [ "$XD_ADMIN" == "" ]; then
		printf "${red}No xd-admin found.${reset}\n"
	else
		printf "${green}Found xd-admin script: ${XD_ADMIN}${reset}\n"
		nohup $XD_ADMIN 2>&1 > /tmp/xd-admin.log &
	fi
}

function start_xd_container() {
	if [ "$XD_CONTAINER" == "" ]; then
		printf "${red}No xd-container found.${reset}\n"
	else
		printf "${green}Found xd-container script: ${XD_CONTAINER}${reset}\n"
		nohup $XD_CONTAINER 2>&1 > /tmp/xd-container.log &
	fi
}


#
# check what to do
#
if [ "$START" == 1 ]; then
  start_zookeeper;
  start_redis;
  start_hsql;
  start_kafka;

  if [ "$XD_ENABLED" -ne "" ]; then
	  start_xd_admin;
	  start_xd_container;
  fi

  exit 0
fi

if [ "$KILL" == 1 ]; then
	printf "${yellow}Killing riox services...${reset}\n"
	pkill redis-server
	$KAFKA_STOP
	$ZK stop
	kill -9 $(ps -eaf | grep hsqldb | grep -v grep | awk '{print $2}')
	CHECK=1;
fi

function check_output {
	service=$1
	output=$2
	if [ "$KILL" == 1 ]; then
		if [ -z "$output" ]; then
			printf "${green}${service} shutdown${reset}\n"
		else
			printf "${red}${service} still there!${reset}\n"
		fi
	else
		if [ -z "$output" ]; then
			printf "${yellow}${service} seems unavailable.${reset}\n"
		else
			printf "${green}${service} seems OK!${reset}\n"
		fi
	fi
}



if [ "$CHECK" == 1 ]; then

	# check redis
	redis_ok=$(ps -eaf | grep redis-server | grep -v grep)
	check_output "redis" $redis_ok 

	# check zookeeper
	zk_ok=$($ZK status 2>/dev/null | grep Mode | grep -v grep)
	check_output "zookeeper" $zk_ok 

	# check kafka
	kafka_ok=$(ps -eaf | grep kafka | grep -v grep | awk '{print $1}')
	check_output "kafka" $kafka_ok 

	# check hsql
	hsql_ok=$(ps -eaf | grep hsqldb | grep -v grep | awk '{print $1}')
	check_output "hsqldb" $hsql_ok 
fi
