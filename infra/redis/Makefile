RIOX_ENV?=dev

# deploy-cluster:
# 	kubectl create -f cluster/redis-master.yml --namespace=${RIOX_ENV}
# 	kubectl create -f cluster/redis-sentinel-service.yml --namespace=${RIOX_ENV}
# 	kubectl create -f cluster/redis-controller.yml --namespace=${RIOX_ENV}
# 	kubectl create -f cluster/redis-sentinel-controller.yml --namespace=${RIOX_ENV}
# 	# Scale both replication controllers
# 	kubectl scale rc redis --replicas=3  --namespace=${RIOX_ENV}
# 	kubectl scale rc redis-sentinel --replicas=3  --namespace=${RIOX_ENV}
#
# undeploy-cluster:
# 	kubectl scale rc redis --replicas=0  --namespace=${RIOX_ENV}
# 	kubectl scale rc redis-sentinel --replicas=0  --namespace=${RIOX_ENV}
# 	kubectl delete -f cluster/redis-controller.yml --namespace=${RIOX_ENV}
# 	kubectl delete -f cluster/redis-sentinel-controller.yml --namespace=${RIOX_ENV}
# 	kubectl delete -f cluster/redis-sentinel-service.yml --namespace=${RIOX_ENV}

deploy-standalone:
	@echo "Deploying Redis ..."
	kubectl create -f redis-master.yml  --namespace=${RIOX_ENV}
	kubectl create -f redis-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Redis ..."
	kubectl scale rc redis-master --replicas=0 --namespace=${RIOX_ENV}
	kubectl delete -f redis-master.yml --namespace=${RIOX_ENV}
	kubectl delete -f redis-service.yml --namespace=${RIOX_ENV}

.PHONY: deploy-cluster undeploy-cluster deploy-standalone undeploy-standalone
