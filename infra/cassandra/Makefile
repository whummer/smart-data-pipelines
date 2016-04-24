RIOX_ENV?=development
IMAGE=gcr.io/google_containers/cassandra
VERSION=v6

deploy-cluster:
	@echo "Deploying Cassandra cluster..."
	kubectl create -f cassandra-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f cassandra-service.yml --namespace=${RIOX_ENV}

undeploy-cluster:
	@echo "Undeploying Cassandra cluster..."
	kubectl stop -f cassandra-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f cassandra-service.yml --namespace=${RIOX_ENV}

.PHONY: deploy-standalone undeploy-standalone build push
