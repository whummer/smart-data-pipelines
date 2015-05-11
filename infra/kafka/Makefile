VERSION=latest
IMAGE=riox/kafka

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying Kafka ..."
	kubectl create -f kafka-controller.yml
	kubectl create -f kafka-service.yml

undeploy: 
	@echo "Undeploying Kafka ..."
	kubectl resize rc kafka --replicas=0
	kubectl delete -f kafka-controller.yml
	kubectl delete -f kafka-service.yml

.PHONY: build push all clean deploy undeploy
