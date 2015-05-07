#!/bin/bash

BASEDIR=$(dirname $0) 

echo "Deploying DNS"
kubectl create -f ${BASEDIR}/k8s-dns/dns-controller.yml --namespace=default
kubectl create -f ${BASEDIR}/k8s-dns/dns-service.yml --namespace=default
