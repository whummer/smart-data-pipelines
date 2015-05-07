#!/bin/bash

echo "Deleting DNS..."
kubectl resize rc kube-dns --replicas=0
kubectl delete -f k8s-dns/dns-controller.yml #--namespace=default
kubectl delete -f k8s-dns/dns-service.yml #--namespace=default
