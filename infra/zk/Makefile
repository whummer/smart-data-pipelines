RIOX_ENV?=development
ZK_CLUSTER_INSTANCES?=3
ZK_RELEASE=3.4.6

build-image:
	docker build -t riox/zookeeper-exhibitor:${ZK_RELEASE} docker-zk-exhibitor

push-image:
	docker push riox/zookeeper-exhibitor:${ZK_RELEASE}

deploy-standalone:
	@echo "Deploying Zookeeper standalone ..."
	kubectl create -f zk-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-rc-single.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Zookeeper standalone ..."
	kubectl stop -f zk-rc-single.yml --namespace=${RIOX_ENV}
	kubectl stop -f zk-service.yml --namespace=${RIOX_ENV}

deploy-cluster:
	@echo "Deploying Zookeeper cluster ..."
	kubectl create -f zk-service.yml --namespace=${RIOX_ENV}
	kubectl create -f zk-rc-aws.yml --namespace=${RIOX_ENV}
	kubectl scale rc zookeeper --replicas=${ZK_CLUSTER_INSTANCES} --namespace=${RIOX_ENV}

undeploy-cluster:
	@echo "Undeploying Zookeeper cluster ..."
	kubectl stop -f zk-rc-aws.yml --namespace=${RIOX_ENV}
	kubectl stop -f zk-service.yml --namespace=${RIOX_ENV}

.PHONY: deploy-cluster undeploy-cluster
