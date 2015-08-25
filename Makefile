# Environment to deploy to (default: test)
RIOX_ENV?=test
IMAGE=riox/hyperriox
IMAGE_VERSION?=latest
TEST_TIMEOUT= # set this to --no-timeouts in case the test times out.

NPATH=/usr/local/lib/node_modules/
ifeq ($(USE_NODENV), true)
NPATH=/opt/boxen/nodenv/versions/v0.12.7/lib/node_modules/
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
	npm install -g gulp mocha gulp-mocha nodemon pm2 linklocal node-gyp node-pre-gyp gulp-help del vinyl-paths run-sequence bower

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
	docker build -t ${IMAGE}:${IMAGE_VERSION} .
	#infra/bin/docker-squash-image.sh

push-image:
	docker push ${IMAGE}:${IMAGE_VERSION}

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
.PHONY: deploy-services undeploy-services scaledown-services render-template

render-template:
	(cd gateway && ../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd web-ui && ../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/analytics-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/files-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pipes-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/users-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/access-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/gateway-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pricing-service && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)

deploy-services: render-template
	(cd web-ui && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/users-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pipes-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/access-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/gateway-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pricing-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd gateway && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

replace-rc: render-template
	(cd services/users-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd web-ui && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pipes-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/access-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/gateway-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pricing-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd gateway && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})

rolling-update:
	kubectl rolling-update --namespace=${RIOX_ENV} users-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} analytics-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} files-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} gateway --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} riox-ui --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} pipes-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} access-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} gateway-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} pricing-service --image=riox/hyperriox:${IMAGE_VERSION}

scaledown-services:
	kubectl scale --replicas=0 rc users-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc gateway --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc riox-ui --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc analytics-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc files-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc pipes-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc access-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc gateway-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc pricing-service --namespace=${RIOX_ENV}

scaleup-services:
	kubectl scale --replicas=2 rc users-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc gateway --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc riox-ui --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc analytics-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc files-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc pipes-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc access-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc gateway-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc pricing-service --namespace=${RIOX_ENV}

undeploy-services:
	-(cd services/users-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd gateway && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd web-ui && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/analytics-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/files-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/pipes-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/access-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/gateway-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/pricing-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
