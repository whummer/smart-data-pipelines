#!/bin/bash
BOOT2DOCKER_ETH1_IP=$(boot2docker ssh ifconfig eth1  | grep "inet addr:"  | awk '{print $2}' | cut -d':' -f2)
sudo route -n add 10.0.0.0/16 $BOOT2DOCKER_ETH1_IP
sudo route -n add 172.17.0.0/16 $BOOT2DOCKER_ETH1_IP
