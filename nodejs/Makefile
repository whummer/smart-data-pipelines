# Environment to deploy to (default: test)
RIOX_ENV?=test
RIOX_VERSION?=latest
IMAGE=riox/hyperriox
TEST_TIMEOUT= # set this to --no-timeouts in case the test times out.

NPATH=/usr/local/lib/node_modules/
ifeq ($(USE_NODENV), true)
NPATH=/opt/boxen/nodenv/versions/v0.12.2/lib/node_modules/
endif

export NODE_PATH=$(NPATH)

###############
# TARGETS for setting up all node dependencies
###############
install:
	(cd bin && node handle-global-node-packages.js && cd ..)
	npm install
	gulp ui:bower

install-prereq:
	npm install -g gulp mocha nodemon	pm2

uninstall-global:
	(cd bin && node handle-global-node-packages.js --uninstall && cd ..)

clean:
	gulp deps:clean:all

pm2-run:
	(pm2 delete all && pm2 flush; cd services && pm2 start riox-pm2.json && cd .. && pm2 logs)


###############
# TARGETS for building the Hyperriox image (container all the microservices)
###############
build-image:
	docker build -t ${IMAGE}:${RIOX_VERSION} .

push-image:
	docker push ${IMAGE}:${RIOX_VERSION}

###############
# TARGETS for testing during development
###############
run-e2e-test:
	# We have to provide the DNS flag with our internal K8S DNS server. This way we don't have to actually deploy the
	# container through K8S just for the test.
	docker run --rm -it --dns=10.0.0.100 -v `pwd`:/code riox/nodejs-base bash -c "cd services && mocha ${TEST_TIMEOUT}"


###############
# TARGETS for deployment
###############
.PHONY: deploy-services undeploy-services scaledown-services

deploy-services:
	(cd gateway && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd web-ui && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/streams-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/users-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

scaledown-services:
	kubectl scale --replicas=0 rc gateway --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc riox-ui --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc analytics-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc files-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc streams-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc users-service --namespace=${RIOX_ENV}

undeploy-services: scaledown-services
	(cd gateway && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
	(cd web-ui && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/streams-service && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/users-service && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
