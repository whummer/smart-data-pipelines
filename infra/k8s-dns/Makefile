deploy:
	@echo "Deploying Kubernetes DNS ..."
	kubectl create -f dns-controller.yml --namespace=kube-system
	kubectl create -f dns-service.yml  --namespace=kube-system

undeploy:
	@echo "Undeploying Kubernetes DNS ..."
	kubectl scale rc kube-dns-v8 --replicas=0  --namespace=kube-system
	kubectl delete -f dns-controller.yml --namespace=kube-system
	kubectl delete -f dns-service.yml --namespace=kube-system

.PHONY: deploy undeploy
