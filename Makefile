# Environment to deploy to (default: test)
RIOX_ENV?=test
IMAGE=riox/hyperriox
IMAGE_VERSION?=latest
TEST_TIMEOUT= # set this to --no-timeouts in case the test times out.

NPATH=/usr/local/lib/node_modules/
ifdef NODENV_ROOT
NPATH=/opt/boxen/nodenv/versions/v0.12.7/lib/node_modules/
endif

$(info NODE_PATH is $(NPATH))
export NODE_PATH=$(NPATH)

###############
# TARGETS for setting up all node dependencies
###############

install-prereq:
	npm install --unsafe-perm -g gulp linklocal bower nodemon pm2
	npm install
	make install
	make install-gateway
	# gulp gulp-help mocha gulp-mocha node-gyp node-pre-gyp del vinyl-paths run-sequence browser-sync merge

install:
	(cd bin && node handle-global-node-packages.js && cd ..)
	(cd bin && node preinstall.js && cd ..)
	gulp ui:bower

install-gateway:
	brew install lua51 # you need this version!
	brew install luajit
	brew install homebrew/nginx/openresty
	luarocks-5.1 install luasocket
	luarocks-5.1 install ansicolors
	luarocks-5.1 install luasec 0.4-4
	luarocks-5.1 install lua-cjson 2.1.0-1
	luarocks-5.1 install busted 1.9.0-1
	luarocks-5.1 install lapis 1.0.4-1
	luarocks-5.1 install moonscript 0.2.4-1
	luarocks-5.1 install inspect 1.2-2
	luarocks-5.1 install luajwt 1.3-2
	sudo git clone --recursive https://github.com/whummer/redx.git /opt/redx

clean:
	gulp deps:clean:all

pm2-run:
	(pm2 delete all && pm2 flush; cd services && pm2 start riox-pm2.json && cd .. && pm2 logs)


###############
# TARGETS for running the infrastructure
###############

infra:
	infra/bin/rioxStartAll.sh

infra-stop:
	docker ps | grep google_containers | awk '{print $$1}' | xargs docker rm -f

tunnel:
	infra/bin/dockermachine-route.sh
	infra/bin/dockermachine-k8s-tunnel.sh

###############
# TARGETS for building the Hyperriox image (contains all the microservices)
###############
build-image:
	docker build -t ${IMAGE}:${IMAGE_VERSION} .

build-test-image:
	docker build -f services/test/Dockerfile -t riox/hyperriox-test:${IMAGE_VERSION} .

push-image:
	docker push ${IMAGE}:${IMAGE_VERSION}

###############
# TARGETS for testing during CI runs
###############

run-integration-tests:
	(cd services/test && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/test && kubectl create -f k8s.yml --namespace=${RIOX_ENV})

run-integration-tests-local:
	(cd services/test && PULL_POLICY=IfNotPresent IMAGE_NAME=hyperriox-test ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/test && kubectl create -f k8s.yml --namespace=${RIOX_ENV} --validate=false)
	echo "Trying to attach to stdout of test process after a short while..."
	sleep 15 && kubectl --namespace=${RIOX_ENV} logs -f integration-tests

cleanup-integration-tests:
	-(cd services/test && kubectl delete -f k8s.yml --namespace=${RIOX_ENV})
	-kubectl delete rc,pod,service -l role=scsm-module --namespace=${RIOX_ENV}

###############
# TARGETS for deployment
###############

services:
	gulp riox

start-gateway:
	cat /etc/hosts | grep platform.riox.io || (echo '127.0.0.1 platform.riox.io' | sudo tee -a /etc/hosts)
	sudo openresty -c $(shell pwd)/infra/nginx/nginx.dev.conf

render-template:
	(cd web-ui && ../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/analytics-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/files-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pipes-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/users-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/access-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/gateway-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)
	(cd services/pricing-service && ../../bin/templater.sh k8s.tmpl.yml > k8s.yml)

deploy-services: render-template
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

.PHONY: deploy-services undeploy-services scaledown-services render-template infra services
