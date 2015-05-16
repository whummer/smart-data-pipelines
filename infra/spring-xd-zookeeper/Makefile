VERSION=1.1.2
IMAGE=riox/springxd-zookeeper

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

deploy:
	@echo "Deploying Zookeeper ..."
	kubectl create -f zookeeper-controller.yml
	kubectl create -f zookeeper-service.yml

undeploy: 
	@echo "Undeploying Zookeeper ..."
	kubectl resize rc zookeeper --replicas=0
	kubectl delete -f zookeeper-controller.yml
	kubectl delete -f zookeeper-service.yml

.PHONY: build push all deploy undeploy
