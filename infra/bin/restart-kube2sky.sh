#!/bin/bash
docker ps | grep kube2sky | awk -F' ' '{ print $1 }' | xargs docker restart
