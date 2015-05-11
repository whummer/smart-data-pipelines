deploy:
	@echo "Deploying Kubernetes DNS ..."
	kubectl create -f dns-controller.yml --namespace=default
	kubectl create -f dns-service.yml --namespace=default

undeploy: 
	@echo "Undeploying Kubernetes DNS ..."
	kubectl resize rc kube-dns --replicas=0 --namespace=default
	kubectl delete -f dns-controller.yml --namespace=default
	kubectl delete -f dns-service.yml --namespace=default

.PHONY: deploy undeploy
