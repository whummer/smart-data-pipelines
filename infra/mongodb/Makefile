RIOX_ENV?=dev

deploy:
	@echo "Deploying Mongo ..."
	kubectl create -f mongodb-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f mongodb-service.yml --namespace=${RIOX_ENV}

undeploy:
	@echo "Undeploying Mongo ..."
	kubectl scale rc mongo --replicas=0 --namespace=${RIOX_ENV}
	kubectl delete -f mongodb-controller.yml --namespace=${RIOX_ENV}
	kubectl delete -f mongodb-service.yml --namespace=${RIOX_ENV}

.PHONY: deploy undeploy
