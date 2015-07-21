RIOX_ENV?=development

deploy-standalone:
	kubectl create -f zk-single-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-single-rc.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	kubectl scale rc zookeeper --replicas=0 --namespace=${RIOX_ENV}
	kubectl delete -f zk-single-rc.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-single-service.yml --namespace=${RIOX_ENV}

deploy-cluster:
	@echo "Deploying Zookeeper cluster ..."
	kubectl create -f zk-1-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-2-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-3-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-1-pod.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-2-pod.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-3-pod.yml --namespace=${RIOX_ENV}

#	kubectl create -f dns-service.yml --namespace=${RIOX_ENV}

undeploy-cluster:
	@echo "Undeploying Zookeeper cluster ..."
	kubectl delete -f zk-1-service.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-2-service.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-3-service.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-1-pod.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-2-pod.yml --namespace=${RIOX_ENV}
	kubectl delete -f zk-3-pod.yml --namespace=${RIOX_ENV}


.PHONY: deploy-cluster undeploy-cluster
