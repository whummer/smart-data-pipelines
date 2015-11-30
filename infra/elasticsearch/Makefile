RIOX_ENV?=development
IMAGE=riox/elasticsearch
VERSION=latest

deploy-standalone:
	@echo "Deploying Elasticsearch standalone..."
	kubectl create -f elasticsearch-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f elasticsearch-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Elasticsearch standalone..."
	-kubectl stop -f elasticsearch-controller.yml --namespace=${RIOX_ENV}
	-kubectl stop -f elasticsearch-service.yml --namespace=${RIOX_ENV}

build:
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

.PHONY: deploy-standalone undeploy-standalone build push
