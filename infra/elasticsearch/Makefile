RIOX_ENV?=development

deploy-standalone:
	@echo "Deploying Elasticsearch standalone..."
	kubectl create -f elasticsearch-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f elasticsearch-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Elasticsearch standalone..."
	kubectl stop -f elasticsearch-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f elasticsearch-service.yml --namespace=${RIOX_ENV}

.PHONY: deploy-standalone undeploy-standalone
