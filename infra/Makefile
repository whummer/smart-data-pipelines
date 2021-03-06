#
# This Makefile composes several other image build, push and deploy processes into a single file.
# It only considers images that are directly relevant to running the entire dependencies for the
# Riox stack.
#

compose = docker-compose
ifeq ($(USE_FIG), true)
compose = fig
endif

#
# This is for using OpenShift CLI (OC) when we deploy to RI
#
DEPLOYER_CLI?=kubectl

.PHONY: build-images push-images deploy-k8s deploy-k8s-dns deploy-services deploy-services-dev clean

init-cluster:
	-(cd k8s-namespaces && make deploy)
	-(cd cluster && kubectl create -f secrets.yml --namespace=production)
	-(cd cluster && kubectl create -f secrets.yml --namespace=staging)
	-(cd cluster && kubectl create -f secrets.yml --namespace=test)
	-(cd cluster && kubectl create -f secrets.yml --namespace=development)

#
# Init target for RI Infrastructure
#
init-oc-projects:
	-oc new-project riox-staging
	-oc new-project riox-production
	-oc new-project riox-test
	-(cd cluster && kubectl create -f secrets.yml --namespace=riox-production)
	-(cd cluster && kubectl create -f secrets.yml --namespace=riox-staging)
	-(cd cluster && kubectl create -f secrets.yml --namespace=riox-test)

build-push: build-images push-images

build-images:
	(cd hyperkube && make build)
	(cd kafka && make build)
	(cd nginx && make build)
	(cd elasticsearch && make build)
	(cd mongodb && make build)

push-images:
	(cd hyperkube && make push)
	(cd kafka && make push)
	(cd nginx && make push)
	(cd elasticsearch && make push)
	(cd mongodb && make build)

deploy-k8s:
	$(compose) -f k8s.yml up -d

deploy-k8s-dns:
	(cd k8s-dns && make deploy)
	(../bin/handleSkyDnsEntries.sh insert)

undeploy-k8s-dns:
	(cd k8s-dns && make undeploy)

deploy-services:
	(cd mongodb && make deploy-standalone)
	(cd redis && make deploy-cluster)
	(cd elasticsearch && make deploy-standalone)
	(cd nginx && make deploy)
	(cd cassandra && make deploy-cluster)

deploy-services-dev:
	(cd mongodb && make deploy-standalone)
	(cd redis && make deploy-cluster)
	(cd elasticsearch && make deploy-standalone)
	(cd cassandra && make deploy-cluster)

undeploy-services:
	-(cd mongodb && make undeploy)
	-(cd redis && make undeploy-cluster)
	-(cd elasticsearch && make undeploy-standalone)
	-(cd nginx && make undeploy)
	-(cd cassandra && make undeploy-cluster)
