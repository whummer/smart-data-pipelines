VERSION=latest
IMAGE=riox/kafka
RIOX_ENV?=development
KAFKA_CLUSTER_INSTANCES?=3

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy-standalone:
	@echo "Deploying Kafka standalone..."
	kubectl create -f kafka-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f kafka-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Kafka standalone..."
	kubectl stop -f kafka-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f kafka-service.yml --namespace=${RIOX_ENV}

deploy-cluster:
	@echo "Deploying Kafka standalone..."
	kubectl create -f kafka-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f kafka-service.yml --namespace=${RIOX_ENV}
	kubectl scale rc kafka --replicas=${KAFKA_CLUSTER_INSTANCES} --namespace=${RIOX_ENV}

undeploy-cluster:
	@echo "Undeploying Kafka standalone..."
	kubectl stop -f kafka-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f kafka-service.yml --namespace=${RIOX_ENV}

.PHONY: build push deploy-standalone undeploy-standalone deploy-cluster undeploy-cluster
