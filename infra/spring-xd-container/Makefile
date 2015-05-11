VERSION=1.1.1
IMAGE=riox/springxd-container

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying Spring XD Container ..."
	kubectl create -f xd-container-controller.yml
	kubectl create -f xd-container-inbound-service.yml
	kubectl create -f xd-container-outbound-service.yml

undeploy: 
	@echo "Undeploying Spring XD Container ..."
	kubectl resize rc xd-container --replicas=0
	kubectl delete -f xd-container-controller.yml
	kubectl delete -f xd-container-inbound-service.yml
	kubectl delete -f xd-container-outbound-service.yml

.PHONY: build push all deploy undeploy
