#!/bin/bash

echo "Setting up portforward for boot2docker..."
VBoxManage controlvm boot2docker-vm natpf1 "redis,tcp,127.0.0.1,6379,,6379"
VBoxManage controlvm boot2docker-vm natpf1 "springxd,tcp,127.0.0.1,9393,,9393"
VBoxManage controlvm boot2docker-vm natpf1 "hsqldb,tcp,127.0.0.1,9101,,9101"
VBoxManage controlvm boot2docker-vm natpf1 "zookeeper,tcp,127.0.0.1,2181,,2181"
VBoxManage controlvm boot2docker-vm natpf1 "mongo,tcp,127.0.0.1,27017,,27017"
VBoxManage controlvm boot2docker-vm natpf1 "rabbitmq,tcp,127.0.0.1,5672,,5672"
VBoxManage controlvm boot2docker-vm natpf1 "rabbitmq-ui,tcp,127.0.0.1,15672,,15672"
VBoxManage controlvm boot2docker-vm natpf1 "kafka,tcp,127.0.0.1,9092,,9092"
