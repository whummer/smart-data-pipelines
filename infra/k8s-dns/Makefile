deploy:
	@echo "Deploying Kubernetes DNS ..."
	../../bin/templater.sh dns-endpoint.tmpl.yml > dns-endpoint.yml
	kubectl create -f dns-endpoint.yml --namespace=kube-system
	kubectl create -f dns-service.yml  --namespace=kube-system --validate=false

undeploy:
	@echo "Undeploying Kubernetes DNS ..."
	kubectl delete -f dns-endpoint.yml --namespace=kube-system
	kubectl delete -f dns-service.yml --namespace=kube-system

.PHONY: deploy undeploy
