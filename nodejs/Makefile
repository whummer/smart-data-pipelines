VERSION=latest
IMAGE=riox/nodejs-base
TEST_TIMEOUT= # set this to --no-timeouts in case the test times out.

all: build-image push-image

NPATH=/usr/local/lib/node_modules/
ifeq ($(USE_NODENV), true)
NPATH=/opt/boxen/nodenv/versions/v0.12.2/lib/node_modules/
endif

export NODE_PATH=$(NPATH)

install:
	(cd bin && node handle-global-node-packages.js && cd ..)
	npm install
	gulp ui:bower

all: build-image push-image

install-prereq:
	npm install -g gulp mocha nodemon	pm2


uninstall-global:
	(cd bin && node handle-global-node-packages.js --uninstall && cd ..)

clean:
	gulp deps:clean:all

pm2-run:
	(pm2 delete all && pm2 flush; cd services && pm2 start riox-pm2.json && cd .. && pm2 logs)

build-image:
	docker build -t ${IMAGE}:${VERSION} .

push-image:
	docker push ${IMAGE}:${VERSION}

run-e2e-test:
	# We have to provide the DNS flag with our internal K8S DNS server. This way we don't have to actually deploy the
	# container through K8S just for the test.
	docker run --rm -it --dns=10.0.0.100 -v `pwd`:/code riox/nodejs-base bash -c "cd services && mocha ${TEST_TIMEOUT}"

run-xd-shell:
	# Spring XS shell. Connect with "admin config server http://xd-admin.dev.riox.internal:9393"
	docker run --rm -it --dns=10.0.0.100 -v `pwd`:/code riox/springxd-shell:1.1.1

.PHONY: build push all clean e2e-test xd-shell install
