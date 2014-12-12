#!/bin/bash

(
cd infra

echo "Restarting boot2docker"
boot2docker restart
sleep 2

echo "Running MongoDB"
docker rm mongodb
docker run -d -p 27017:27017 --name mongodb dockerfile/mongodb mongod
VBoxManage controlvm boot2docker-vm natpf1 "mongodb,tcp,127.0.0.1,27017,,27017"
sleep 2

echo "Running Eureka"
docker rm eureka
docker run -d -p 10000:80 --name eureka riox/eureka
VBoxManage controlvm boot2docker-vm natpf1 "eureka,tcp,127.0.0.1,10000,,10000"
sleep 2

echo "Wait up to 2 minutes until Eureka has started..."

)
