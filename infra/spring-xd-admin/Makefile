VERSION=1.1.1
IMAGE=riox/springxd-admin

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying Spring XD Admin ..."
	kubectl create -f xd-admin-controller.yml
	kubectl create -f xd-admin-service.yml

undeploy: 
	@echo "Undeploying Spring XD Admin ..."
	kubectl resize rc xd-admin --replicas=0
	kubectl delete -f xd-admin-controller.yml
	kubectl delete -f xd-admin-service.yml

.PHONY: build push all deploy undeploy
