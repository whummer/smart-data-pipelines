RIOX_ENV=production

deploy-cluster:
	@echo "Deploying Zookeeper ..."
	kubectl create -f zk-1-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-2-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-3-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-1-pod.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-2-pod.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-3-pod.yml --namespace=${RIOX_ENV}

#	kubectl create -f dns-service.yml --namespace=${RIOX_ENV}

undeploy-cluster:
	@echo "Undeploying Zookeeper ..."
	kubectl delete -f zk-1-service.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-2-service.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-3-service.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-1-pod.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-2-pod.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-3-pod.yml --namespace=${RIOX_ENV}


.PHONY: deploy-cluster undeploy-cluster
