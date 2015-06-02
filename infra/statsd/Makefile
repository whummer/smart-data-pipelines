VERSION=latest
IMAGE=riox/statsd-mongo

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying statsd ..."
	kubectl create -f statsd-controller.yml
	kubectl create -f statsd-service-statsd.yml
	kubectl create -f statsd-service-graphite.yml
	kubectl create -f statsd-service-graphite-ui.yml

undeploy:
	@echo "Undeploying statsd ..."
	kubectl resize rc statsd --scale=0
	kubectl delete -f statsd-controller.yml
	kubectl delete -f statsd-service-statsd.yml
	kubectl delete -f statsd-service-graphite.yml
	kubectl delete -f statsd-service-graphite-ui.yml

.PHONY: deploy undeploy
