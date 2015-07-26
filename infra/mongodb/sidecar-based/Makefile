RIOX_ENV?=development

CLUSTER_REPLICAS?=3
REPLICA_SET=rs0

deploy-cluster: 
	@echo "Deploying MongoDB in replicated mode. #Replicas: ${CLUSTER_REPLICAS}"
	cat mongodb-controller-replicated.tmpl.yml | sed 's/@MONGO_REPLICAS@/${CLUSTER_REPLICAS}/' \
		| sed 's/@ARGS@/"--smallfiles", "--replSet=${REPLICA_SET}"/' > mongodb-controller.yml ;
	make deploy

deploy-standalone:
	@echo "Deployin MongoDB in standalone mode."
	cat mongodb-controller.tmpl.yml | sed 's/@MONGO_REPLICAS@/1/' \
		| sed 's/@ARGS@/"--smallfiles"/' > mongodb-controller.yml ;
	make deploy

deploy:
	kubectl create -f mongodb-controller.yml --namespace=${RIOX_ENV}
	kubectl create -f mongodb-service.yml --namespace=${RIOX_ENV}

undeploy:
	@echo "Undeploying Mongo ..."
	kubectl scale rc mongo --replicas=0 --namespace=${RIOX_ENV}
	kubectl delete -f mongodb-controller.yml --namespace=${RIOX_ENV}
	kubectl delete -f mongodb-service.yml --namespace=${RIOX_ENV}

clean:
	rm mongodb-controller.yml

.PHONY: deploy undeploy deploy-cluster deploy-standalone clean
