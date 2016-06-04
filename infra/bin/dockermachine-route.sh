#!/bin/bash
MACHINE=default
MACHINE_ETH1_IP=$(docker-machine ssh $MACHINE ifconfig eth1  | grep "inet addr:"  | awk '{print $2}' | cut -d':' -f2)
echo $MACHINE_ETH1_IP
sudo route -n add 10.0.0.0/16 $MACHINE_ETH1_IP 2>&1 | grep -v 'File exists'
sudo route -n add 172.17.0.0/16 $MACHINE_ETH1_IP 2>&1 | grep -v 'File exists'

exit 0