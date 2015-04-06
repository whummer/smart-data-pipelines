#!/bin/bash

(
cd infra

echo "Running MongoDB"
docker rm mongodb
docker run -d -p 27017:27017 --name mongodb dockerfile/mongodb mongod --smallfiles
sleep 2

echo "Running ElasticSearch"
docker rm elasticsearch
docker run -d -p 9200:9200 -p 9300:9300 --name elasticsearch dockerfile/elasticsearch
sleep 2

echo "Running ActiveMQ"
docker rm activemq
docker run -d -p 61612:61612 -p 61613:61613 -p 61616:61616 -p 8161:8161 --name activemq aterreno/activemq-dockerfile
sleep 2

echo "Running spring-xd"
docker rm spring-xd
docker run -d -p 9393:9393 -p 9292:9292 --name spring-xd springxd/singlenode

)
