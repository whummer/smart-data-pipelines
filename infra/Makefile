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
	(cd aws && kubectl create -f secrets.yml --namespace=production)
	(cd aws && kubectl create -f secrets.yml --namespace=staging)
	(cd aws && kubectl create -f secrets.yml --namespace=test)

build-push: build-images push-images

build-images:
	(cd nodejs && make build)
	(cd hyperkube && make build)
	(cd kafka && make build)
	(cd spring-xd-base && make build)
	(cd spring-xd-zookeeper && make build)
	(cd statsd && make build)


push-images:
	(cd nodejs && make build)
	(cd hyperkube && make push)
	(cd kafka && make push)
	(cd spring-xd-base && make push)
	(cd spring-xd-zookeeper && make push)
	(cd statsd && make push)


deploy-k8s:
	$(compose) -f k8s.yml up -d

deploy-k8s-dns:
	(cd k8s-dns && make deploy)

undeploy-k8s-dns:
	(cd k8s-dns && make undeploy)

deploy-services:
	(cd spring-xd-zookeeper && make deploy)
	(cd mongodb && make deploy)
	(cd redis && make deploy)
	(cd kafka && make deploy)
	(cd statsd && make deploy)

undeploy-services:
	(cd kafka && make undeploy)
	(cd spring-xd-zookeeper && make undeploy)
	(cd redis && make undeploy)
	(cd mongodb && make undeploy)
	(cd statsd && make undeploy)

# ATTENTION: Use with caution. Stops and removes ALL docker container
clean:
	@while [ -z "$$CONTINUE" ]; do \
		read -r -p "CAUTION: Are you sure you want to delete ALL containers. [yes/N]: " CONTINUE; \
	done ; \
	[ $$CONTINUE = "yes" ] || [ $$CONTINUE = "Yes" ] || (echo "Exiting."; exit 1;)
	@echo "You decided to be screwed ..."
	docker rm -f `docker ps -a -q`
