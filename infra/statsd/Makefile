
deploy:
	@echo "Deploying statsd ..."
	kubectl create -f statsd-controller.yml
	kubectl create -f statsd-service-statsd.yml
	kubectl create -f statsd-service-graphite.yml
	kubectl create -f statsd-service-graphite-ui.yml

undeploy: 
	@echo "Undeploying statsd ..."
	kubectl resize rc statsd --replicas=0
	kubectl delete -f statsd-controller.yml
	kubectl delete -f statsd-service-statsd.yml
	kubectl delete -f statsd-service-graphite.yml
	kubectl delete -f statsd-service-graphite-ui.yml

.PHONY: deploy undeploy
