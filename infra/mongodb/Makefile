SHELL := /bin/bash
RIOX_ENV?=development
IMAGE=riox/mongo
VERSION=latest

CLUSTER_REPLICAS?=3
REPLICA_SET=rs0
REDEPLOY?=1

REPLICA_SUFFIXES:= $(shell seq 1 ${CLUSTER_REPLICAS})
DEPLOYED_CONTROLLERS=$(shell kubectl get rc --namespace=${RIOX_ENV} | grep mongo | awk '{print $4}' | cut -d'=' -f 2)
DEPLOYED_SERVICES=$(shell kubectl get services --namespace=${RIOX_ENV} | grep mongo | awk '{print $3}' | cut -d'=' -f 2)

deploy: deploy-standalone 

deploy-standalone:
	@echo "Deploying MongoDB in standalone mode."
	@if [ "$(REDEPLOY)" -eq 1 ] && ( [ -n "$(DEPLOYED_CONTROLLERS)" ]  || [ -n "$(DEPLOYED_SERVICES)" ]) ; then \
		$(MAKE) undeploy ; \
	fi

	kubectl create -f mongodb-controller-single.yml --namespace=${RIOX_ENV}
	kubectl create -f mongodb-service-single.yml --namespace=${RIOX_ENV}

deploy-cluster: 
	@echo "Deploying MongoDB in replicated mode. #Replicas: ${CLUSTER_REPLICAS}"
	@for SUFFIX in ${REPLICA_SUFFIXES} ; do \
		kubectl create -f mongodb-controller-$${SUFFIX}.yml --namespace=${RIOX_ENV}; \
		kubectl create -f mongodb-service-$${SUFFIX}.yml --namespace=${RIOX_ENV}; \
	done

init-cluster:
	./setup-replicas.sh

status:
	@echo "Deployed controllers: ${DEPLOYED_CONTROLLERS}"
	@echo "Deployed services: ${DEPLOYED_SERVICES}"

undeploy:
	@echo "Undeploying Mongo. Using namespace ${RIOX_ENV}"

	@if [ -z "$(DEPLOYED_CONTROLLERS)" ]; then \
		echo "Warning: No deployed controllers found." ; \
	else \
		echo "Deployed controllers: $(DEPLOYED_CONTROLLERS)"; \
	fi
		

	@for CTRL in $(DEPLOYED_CONTROLLERS) ; do \
		if [[ "$$CTRL" == mongo* ]]; then \
			echo "Shutting down controller $$CTRL" ; \
			kubectl stop rc $$CTRL --namespace=${RIOX_ENV} ; \
		fi; \
	done;

	@if [ -z "$(DEPLOYED_SERVICES)" ]; then \
		echo "Warning: No deployed services found." ; \
	else \
		echo "Deployed services: $(DEPLOYED_SERVICES)"; \
	fi

	@for SVC in $(DEPLOYED_SERVICES) ; do \
		if [[ "$$SVC" == mongo* ]]; then \
			echo "Shutting down service  $$SVC" ; \
			kubectl stop service $$SVC --namespace=${RIOX_ENV}; \
		fi; \
	done;

	@echo "Undeployed Mongo."


build:
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

.PHONY: build push deploy undeploy deploy-cluster deploy-standalone status
