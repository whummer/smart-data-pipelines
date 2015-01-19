#!/bin/bash

(
cd infra

#echo "Restarting boot2docker"
#boot2docker restart
#sleep 2

echo "Running MongoDB"
docker rm mongodb
docker run -d -p 27017:27017 --name mongodb dockerfile/mongodb mongod --smallfiles
VBoxManage controlvm boxen-boot2docker-vm natpf1 "mongodb,tcp,127.0.0.1,27017,,27017"
sleep 2

echo "Running ElasticSearch"
docker rm elasticsearch
docker run -d -p 9200:9200 -p 9300:9300 --name elasticsearch dockerfile/elasticsearch
VBoxManage controlvm boxen-boot2docker-vm natpf1 "elasticsearch1,tcp,127.0.0.1,9200,,9200"
VBoxManage controlvm boxen-boot2docker-vm natpf1 "elasticsearch2,tcp,127.0.0.1,9300,,9300"
sleep 2

#echo "Running Eureka"
#docker rm eureka
#docker run -d -p 10000:80 --name eureka riox/eureka
#VBoxManage controlvm boxen-boot2docker-vm natpf1 "eureka,tcp,127.0.0.1,10000,,10000"
#sleep 2

#echo "Running ActiveMQ"
#docker rm activemq
#docker run -d -p 61612:61612 -p 61613:61613 -p 61616:61616 -p 8161:8161 --name activemq aterreno/activemq-dockerfile
#VBoxManage controlvm boxen-boot2docker-vm natpf1 "activemq1,tcp,127.0.0.1,61612,,61612"
#VBoxManage controlvm boxen-boot2docker-vm natpf1 "activemq2,tcp,127.0.0.1,61613,,61613"
#VBoxManage controlvm boxen-boot2docker-vm natpf1 "activemq3,tcp,127.0.0.1,61616,,61616"
#VBoxManage controlvm boxen-boot2docker-vm natpf1 "activemq4,tcp,127.0.0.1,8161,,8161"
#:wq
sleep 2

echo "Wait up to 2 minutes until Eureka has started..."

)
