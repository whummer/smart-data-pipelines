RIOX_ENV?=development

MONGO_REPLICAS?=3

deploy-cluster:
	@echo "Replicas: ${MONGO_REPLICAS}"
	cat mongodb-controller.tmpl.yml | sed 's/@MONGO_REPLICAS@/${MONGO_REPLICAS}/' \
		| sed 's/@ARGS@/"--smallfiles", "--replSet=rs0"/' > mongodb-controller.yml ;
	make deploy

deploy-standalone:
	cat mongodb-controller.tmpl.yml | sed 's/@MONGO_REPLICAS@/1/' \
		| sed 's/@ARGS@/"--smallfiles"/' > mongodb-controller.yml ;
	make deploy

deploy:
	@echo "Deploying Mongo."
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
