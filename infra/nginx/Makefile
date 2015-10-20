RIOX_ENV?=development
IMAGE=riox/nginx
VERSION=latest

deploy:
	@echo "Deploying Nginx..."
	kubectl create -f nginx-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f nginx-service.yml --namespace=${RIOX_ENV}

undeploy:
	@echo "Undeploying Nginx..."
	kubectl stop -f nginx-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f nginx-service.yml --namespace=${RIOX_ENV}

build:
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

.PHONY: deploy undeploy build push
