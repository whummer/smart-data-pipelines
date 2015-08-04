RIOX_ENV?=development
MYSQL_SLAVE_INSTANCES?=1

deploy-standalone:
	@echo "Deploying MySQL standalone..."
	@if [ "${RIOX_ENV}" == "production" ] ; then \
		kubectl create -f mysql-controller-aws.yml --namespace=${RIOX_ENV} ; \
	else \
		kubectl create -f mysql-controller.yml --namespace=${RIOX_ENV} ; \
	fi
	kubectl create -f mysql-service.yml --namespace=${RIOX_ENV}

undeploy-standalone:
	@echo "Undeploying MySQL standalone..."
	@if [ "${RIOX_ENV}" == "production" ] ; then \
		kubectl stop -f mysql-controller-aws.yml --namespace=${RIOX_ENV} ; \
	else \
		kubectl stop -f mysql-controller.yml --namespace=${RIOX_ENV} ; \
	fi
	kubectl stop -f mysql-service.yml --namespace=${RIOX_ENV}

deploy-cluster: deploy-standalone
# 	@echo "Deploying MySQL cluster..."
# 	kubectl create -f mysql-slave-controller.yml --namespace=${RIOX_ENV}
# 	kubectl create -f mysql-master-controller.yml --namespace=${RIOX_ENV}
# 	kubectl create -f mysql-slave-service.yml --namespace=${RIOX_ENV}
# 	kubectl create -f mysql-master-service.yml --namespace=${RIOX_ENV}
# 	kubectl scale rc mysql-slave --replicas=${MYSQL_SLAVE_INSTANCES} --namespace=${RIOX_ENV}
#
undeploy-cluster: undeploy-standalone
# 	@echo "Undeploying MySQL cluster..."
# 	kubectl stop -f mysql-slave-controller.yml --namespace=${RIOX_ENV}
# 	kubectl stop -f mysql-master-controller.yml --namespace=${RIOX_ENV}
# 	kubectl stop -f mysql-slave-service.yml --namespace=${RIOX_ENV}
# 	kubectl stop -f mysql-master-service.yml --namespace=${RIOX_ENV}

.PHONY: build push deploy-standalone undeploy-standalone deploy-cluster undeploy-cluster
