VERSION=latest
IMAGE=riox/kafka
RIOX_ENV?=development

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying Kafka ..."
	kubectl create -f kafka-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f kafka-service.yml --namespace=${RIOX_ENV}

undeploy:
	@echo "Undeploying Kafka ..."
	kubectl scale rc kafka --replicas=0 --namespace=${RIOX_ENV}
	kubectl delete -f kafka-controller.yml --namespace=${RIOX_ENV}
	kubectl delete -f kafka-service.yml --namespace=${RIOX_ENV}

.PHONY: build push all clean deploy undeploy
