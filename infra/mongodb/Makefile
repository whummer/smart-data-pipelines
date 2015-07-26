RIOX_ENV?=development

CLUSTER_REPLICAS?=3
REPLICA_SET=rs0

REPLICA_SUFFIXES:= $(shell seq 1 ${CLUSTER_REPLICAS})
DEPLOYED_CONTROLLERS=$(shell kubectl get rc | grep mongo | awk '{print $4}' | cut -d'=' -f 2)
DEPLOYED_SERVICES=$(shell kubectl get services | grep mongo | awk '{print $3}' | cut -d'=' -f 2)

deploy: deploy-standalone 

deploy-standalone:
	@echo "Deployin MongoDB in standalone mode."
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
	@echo "Undeploying Mongo."
	@for CTRL in $(DEPLOYED_CONTROLLERS) ; do \
		if [[ "$$CTRL" == mongo* ]]; then \
			echo "Shutting down controller $$CTRL" ; \
			kubectl stop rc $$CTRL ; \
		fi; \
	done;

	@for SVC in $(DEPLOYED_SERVICES) ; do \
		if [[ "$$SVC" == mongo* ]]; then \
			echo "Shutting down service  $$SVC" ; \
			kubectl stop service $$SVC; \
		fi; \
	done;

	@echo "Undeployed Mongo."

.PHONY: deploy undeploy deploy-cluster deploy-standalone status
