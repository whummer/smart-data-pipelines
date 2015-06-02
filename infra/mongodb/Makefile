
deploy:
	@echo "Deploying Mongo ..."
	kubectl create -f mongodb-controller.yml
	kubectl create -f mongodb-service.yml

undeploy:
	@echo "Undeploying Mongo ..."
	kubectl resize rc mongo --scale=0
	kubectl delete -f mongodb-controller.yml
	kubectl delete -f mongodb-service.yml

.PHONY: deploy undeploy
