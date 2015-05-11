#!/bin/bash

echo "Setting up portforward for boot2docker..."
VBoxManage controlvm boot2docker-vm natpf1 "http-alt,tcp,127.0.0.1,8080,,8080"