RIOX_ENV?=development

deploy:
	@echo "Deploying Kafka standalone..."
	kubectl create -f kibana-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f kibana-service.yml --namespace=${RIOX_ENV}

undeploy:
	@echo "Undeploying Kafka standalone..."
	kubectl stop -f kibana-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f kibana-service.yml --namespace=${RIOX_ENV}

.PHONY: deploy-standalone undeploy-standalone
