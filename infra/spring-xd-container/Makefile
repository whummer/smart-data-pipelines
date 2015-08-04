RIOX_ENV?=development

deploy-standalone:
	@echo "Deploying Spring XD Container ..."
	kubectl create -f xd-container-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f xd-container-inbound-service.yml --namespace=${RIOX_ENV}
	kubectl create -f xd-container-outbound-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Spring XD Container ..."
	kubectl stop -f xd-container-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f xd-container-inbound-service.yml --namespace=${RIOX_ENV}
	kubectl stop -f xd-container-outbound-service.yml --namespace=${RIOX_ENV}

deploy-cluster: deploy-standalone

undeploy-cluster: undeploy-standalone

.PHONY: build push all deploy-standalone undeploy-standalone
