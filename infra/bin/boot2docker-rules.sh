#!/bin/bash

VM_IMAGE_NAME=boot2docker-vm
if [ -n "$BOXEN_HOME" ]; then
	VM_IMAGE_NAME="boxen-$VM_IMAGE_NAME"
fi

echo "Using vbox image '$VM_IMAGE_NAME'"
echo "Setting up portforward for boot2docker..."
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "redis,tcp,127.0.0.1,6379,,6379"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "zookeeper,tcp,127.0.0.1,2181,,2181"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "mongo,tcp,127.0.0.1,27017,,27017"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "kafka,tcp,127.0.0.1,9092,,9092"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "kubernetes-api,tcp,127.0.0.1,8080,,8080"

# old stuff
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "hsqldb,tcp,127.0.0.1,9101,,9101"
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "springxd,tcp,127.0.0.1,9393,,9393"
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "spring-xd-http1,tcp,127.0.0.1,9000,,9000"
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "spring-xd-http2,tcp,127.0.0.1,9001,,9001"
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "spring-xd-http3,tcp,127.0.0.1,9002,,9002"
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "rabbitmq,tcp,127.0.0.1,5672,,5672"
#VBoxManage controlvm $VM_IMAGE_NAME natpf1 "rabbitmq-ui,tcp,127.0.0.1,15672,,15672"
