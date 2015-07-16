VERSION=latest
IMAGE=riox/kafka

deploy:
	@echo "Deploying Namespaces ..."
	kubectl create -f namespace-kube-system.yml
	kubectl create -f namespace-production.yml
	kubectl create -f namespace-staging.yml
	kubectl create -f namespace-test.yml

undeploy:
	@echo "Undeploying Namespaces ..."
	kubectl delete -f namespace-production.yml
	kubectl delete -f namespace-staging.yml
	kubectl delete -f namespace-test.yml

.PHONY: deploy undeploy
