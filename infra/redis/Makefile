
deploy:
	@echo "Deploying Redis ..."
	kubectl create -f redis-controller.yml
	kubectl create -f redis-service.yml

undeploy:
	@echo "Undeploying Redis ..."
	kubectl resize rc redis --scale=0
	kubectl delete -f redis-controller.yml
	kubectl delete -f redis-service.yml

.PHONY: deploy undeploy
