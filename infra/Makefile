#
# This Makefile composes several other image build, push and deploy processes into a single file.
# It only considers images that are directly relevant to running the entire dependencies for the
# Riox stack.
#

compose = docker-compose
ifeq ($(USE_FIG), true)
compose = fig
endif

.PHONY: build-images push-images deploy-k8s deploy-k8s-dns deploy-services clean

init-cluster:
	(cd k8s-namespaces && make deploy)
	(cd cluster && kubectl create -f secrets.yml --namespace=production)
	(cd cluster && kubectl create -f secrets.yml --namespace=staging)
	(cd cluster && kubectl create -f secrets.yml --namespace=test)
	(cd cluster && kubectl create -f secrets.yml --namespace=development)

build-push: build-images push-images

build-images:
	(cd hyperkube && make build)
	(cd kafka && make build)
	(cd nginx && make build)

push-images:
	(cd hyperkube && make push)
	(cd kafka && make push)
	(cd nginx && make push)

deploy-k8s:
	$(compose) -f k8s.yml up -d

deploy-k8s-dns:
	(cd k8s-dns && make deploy)
	(../bin/handleSkyDnsEntries.sh insert)

undeploy-k8s-dns:
	(cd k8s-dns && make undeploy)

deploy-services:
	(cd mongodb && make deploy-standalone)
	(cd redis && make deploy-standalone)
	(cd elasticsearch && make deploy-standalone)
	(cd nginx && make deploy)

undeploy-services:
	-(cd mongodb && make undeploy)
	-(cd redis && make undeploy-standalone)
	-(cd elasticsearch && make undeploy-standalone)
	-(cd nginx && make undeploy)

# ATTENTION: Use with caution. Stops and removes ALL docker container
clean:
	@while [ -z "$$CONTINUE" ]; do \
		read -r -p "CAUTION: Are you sure you want to delete ALL containers. [yes/N]: " CONTINUE; \
	done ; \
	[ $$CONTINUE = "yes" ] || [ $$CONTINUE = "Yes" ] || (echo "Exiting."; exit 1;)
	@echo "You decided to be screwed ..."
	docker rm -f `docker ps -a -q`
