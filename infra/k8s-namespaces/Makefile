
deploy:
	@echo "Deploying Namespaces ..."
	-kubectl create -f namespace-production.yml
	-kubectl create -f namespace-staging.yml
	-kubectl create -f namespace-test.yml
	-kubectl create -f namespace-development.yml

undeploy:
	@echo "Undeploying Namespaces ..."
	-kubectl delete -f namespace-production.yml
	-kubectl delete -f namespace-staging.yml
	-kubectl delete -f namespace-test.yml
	-kubectl delete -f namespace-development.yml

.PHONY: deploy undeploy
