VERSION=1.1.1
IMAGE=riox/springxd-hsqldb

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying Spring XD Container ..."
	kubectl create -f hsqldb-controller.yml
	kubectl create -f hsqldb-service.yml

undeploy: 
	@echo "Undeploying Spring XD Container ..."
	kubectl resize rc hsqldb --replicas=0
	kubectl delete -f hsqldb-controller.yml
	kubectl delete -f hsqldb-service.yml

.PHONY: build push all deploy undeploy
