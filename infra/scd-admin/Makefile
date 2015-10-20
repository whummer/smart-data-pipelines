VERSION=1.0.0.BUILD-SNAPSHOT
IMAGE=riox/spring-stream-dataflow

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}


deploy-admin-local:
		@echo "Deploying SCD Admin (local profile) ..."
		kubectl create -f scd-local-controller.yml --namespace=${RIOX_ENV}
		kubectl create -f scd-local-service.yml --namespace=${RIOX_ENV}

undeploy-admin-local:
		@echo "Undeploying SCD Admin (local profile) ..."
		-kubectl delete -f scd-local-controller.yml --namespace=${RIOX_ENV}
		-kubectl delete -f scd-local-service.yml --namespace=${RIOX_ENV}

deploy-admin-k8s:
		@echo "Deploying SCD Admin (k8s profile) ..."
		kubectl create -f scd-k8s-controller.yml --namespace=${RIOX_ENV}
		kubectl create -f scd-k8s-service.yml --namespace=${RIOX_ENV}

undeploy-admin-k8s:
		@echo "Undeploying SCD Admin (k8s profile) ..."
		-kubectl delete -f scd-k8s-controller.yml --namespace=${RIOX_ENV}
		-kubectl delete -f scd-k8s-service.yml --namespace=${RIOX_ENV}


.PHONY: build push all
