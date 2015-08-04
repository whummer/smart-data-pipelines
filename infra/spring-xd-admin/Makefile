

deploy-standalone:
	@echo "Deploying Spring XD Admin ..."
	kubectl create -f xd-admin-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f xd-admin-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Spring XD Admin ..."
	kubectl stop -f xd-admin-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f xd-admin-service.yml --namespace=${RIOX_ENV}

.PHONY: build push all deploy undeploy
