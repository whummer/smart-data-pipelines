#!/bin/bash

IP=172.17.42.1
SUFFIX=development.svc.cluster.local

echo "$IP users-service.$SUFFIX" >> /etc/hosts
echo "$IP organizations-service.$SUFFIX" >> /etc/hosts
echo "$IP gateway-service.$SUFFIX" >> /etc/hosts
echo "$IP pipes-service.$SUFFIX" >> /etc/hosts
echo "$IP proxies-service.$SUFFIX" >> /etc/hosts
echo "$IP pricing-service.$SUFFIX" >> /etc/hosts
echo "$IP riox-ui.$SUFFIX" >> /etc/hosts
echo "$IP ratings-service.$SUFFIX" >> /etc/hosts
echo "$IP notifications-service.$SUFFIX" >> /etc/hosts
echo "$IP access-service.$SUFFIX" >> /etc/hosts
echo "$IP certificates-service.$SUFFIX" >> /etc/hosts
echo "$IP statistics-service.$SUFFIX" >> /etc/hosts
echo "$IP files-service.$SUFFIX" >> /etc/hosts

sleep 4
killall -HUP dnsmasq
exit 0
