RIOX_ENV?=dev
VERSION=latest
IMAGE=riox/statsd-mongo

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying statsd ..."
	kubectl create -f statsd-controller.yml --namespace=$RIOX_ENV
	kubectl create -f statsd-service-statsd.yml --namespace=$RIOX_ENV
	kubectl create -f statsd-service-graphite.yml --namespace=$RIOX_ENV
	kubectl create -f statsd-service-graphite-ui.yml --namespace=$RIOX_ENV

undeploy:
	@echo "Undeploying statsd ..."
	kubectl resize rc statsd --scale=0 --namespace=$RIOX_ENV
	kubectl delete -f statsd-controller.yml --namespace=$RIOX_ENV
	kubectl delete -f statsd-service-statsd.yml --namespace=$RIOX_ENV
	kubectl delete -f statsd-service-graphite.yml --namespace=$RIOX_ENV
	kubectl delete -f statsd-service-graphite-ui.yml --namespace=$RIOX_ENV

.PHONY: deploy undeploy
