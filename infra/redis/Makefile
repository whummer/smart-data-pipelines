RIOX_ENV?=development
VERSION=2.8

build:
	docker build -t riox/redis:${VERSION} image

push:
	docker push riox/redis:${VERSION}

deploy-standalone:
	@echo "Deploying Redis ..."
	kubectl create -f redis-master.yml --namespace=${RIOX_ENV}
	kubectl create -f redis-master-service.yml --namespace=${RIOX_ENV}
	kubectl create -f redis-sentinel-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying Redis ..."
	kubectl stop -f redis-master.yml --namespace=${RIOX_ENV}
	kubectl stop -f redis-master-service.yml --namespace=${RIOX_ENV}
	kubectl stop -f redis-sentinel-service.yml --namespace=${RIOX_ENV}

deploy-cluster:
	kubectl create -f redis-master.yml --namespace=${RIOX_ENV}
	kubectl create -f redis-sentinel-service.yml --namespace=${RIOX_ENV}
	kubectl create -f redis-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f redis-sentinel-controller.yml --namespace=${RIOX_ENV}
	# Scale both replication controllers
	kubectl scale rc redis --replicas=3  --namespace=${RIOX_ENV}
	kubectl scale rc redis-sentinel --replicas=3  --namespace=${RIOX_ENV}
	#sleep 10
	#kubectl delete pods redis-master --namespace=${RIOX_ENV}

undeploy-cluster:
	kubectl stop -f redis-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f redis-sentinel-controller.yml --namespace=${RIOX_ENV}
	kubectl stop -f redis-sentinel-service.yml --namespace=${RIOX_ENV}


.PHONY: deploy-cluster undeploy-cluster deploy-standalone undeploy-standalone
