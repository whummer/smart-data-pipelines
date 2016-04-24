#!/bin/bash

VM_IMAGE_NAME=default
if [ -n "$BOXEN_HOME" ]; then
	VM_IMAGE_NAME="boxen-$VM_IMAGE_NAME"
fi

echo "Using vbox image '$VM_IMAGE_NAME'"
echo "Setting up portforward..."
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "redis,tcp,127.0.0.1,6379,,6379"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "zookeeper,tcp,127.0.0.1,2181,,2181"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "mongo,tcp,127.0.0.1,27017,,27017"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "kafka,tcp,127.0.0.1,9092,,9092"
# This conflicts with the SSL tunnel
# VBoxManage controlvm $VM_IMAGE_NAME natpf1 "kubernetes-api,tcp,127.0.0.1,8080,,8080"
VBoxManage controlvm $VM_IMAGE_NAME natpf1 "etcd,tcp,127.0.0.1,4001,,4001"
