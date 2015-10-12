# Environment to deploy to (default: test)
RIOX_ENV?=test
IMAGE=riox/hyperriox
IMAGE_VERSION?=latest
TEST_TIMEOUT= # set this to --no-timeouts in case the test times out.

NPATH=/usr/local/lib/node_modules/
ifdef NODENV_ROOT
NPATH=/opt/boxen/nodenv/versions/v0.12.7/lib/node_modules/
endif

$(info VAR is $(NPATH))
export NODE_PATH=$(NPATH)

###############
# TARGETS for setting up all node dependencies
###############
install:
	(cd bin && node handle-global-node-packages.js && cd ..)
	npm install
	gulp ui:bower

install-prereq:
	sudo npm install -g gulp@3.9.0 gulp-help@1.6.1 mocha gulp-mocha nodemon pm2 linklocal node-gyp node-pre-gyp del vinyl-paths run-sequence bower browser-sync babel

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
# TARGETS for testing during CI runs
###############

run-integration-tests:
	(cd services/test && ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/test && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

run-integration-tests-local:
	(cd services/test && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/test && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

cleanup-integration-tests:
	(cd services/test && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})

###############
# TARGETS for deployment
###############
.PHONY: deploy-services undeploy-services scaledown-services render-template

render-template:
	(cd web-ui && MOUNT_LOCAL_CMD='#' ../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/analytics-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/files-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pipes-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/users-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/access-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/gateway-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pricing-service && MOUNT_LOCAL_CMD='#' ../../util/templater.sh k8s.tmpl.yml > k8s.yml)

render-template-local:
	(cd web-ui && PULL_POLICY=IfNotPresent ../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/analytics-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/files-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pipes-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/users-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/access-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/gateway-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pricing-service && PULL_POLICY=IfNotPresent ../../util/templater.sh k8s.tmpl.yml > k8s.yml)

deploy-services: render-template
	(cd web-ui && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/users-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pipes-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/access-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/gateway-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pricing-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

deploy-services-local: render-template-local
	(cd web-ui && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/users-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pipes-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/access-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/gateway-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pricing-service && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

replace-rc: render-template
	(cd services/users-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd web-ui && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/analytics-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/files-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pipes-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/access-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/gateway-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})
	(cd services/pricing-service && kubectl replace -f k8s.yml --namespace=${RIOX_ENV})

rolling-update:
	kubectl rolling-update --namespace=${RIOX_ENV} users-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} analytics-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} files-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} riox-ui --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} pipes-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} access-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} gateway-service --image=riox/hyperriox:${IMAGE_VERSION}
	kubectl rolling-update --namespace=${RIOX_ENV} pricing-service --image=riox/hyperriox:${IMAGE_VERSION}

scaledown-services:
	kubectl scale --replicas=0 rc users-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc riox-ui --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc analytics-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc files-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc pipes-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc access-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc gateway-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=0 rc pricing-service --namespace=${RIOX_ENV}

scaleup-services:
	kubectl scale --replicas=2 rc users-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc riox-ui --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc analytics-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc files-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc pipes-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc access-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc gateway-service --namespace=${RIOX_ENV}
	kubectl scale --replicas=2 rc pricing-service --namespace=${RIOX_ENV}

undeploy-services:
	-(cd services/users-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd web-ui && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/analytics-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/files-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/pipes-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/access-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/gateway-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
	-(cd services/pricing-service && kubectl stop -f k8s.yml --namespace=${RIOX_ENV})
