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

build-push: build-images push-images

build-images: 
	(cd hyperkube && make build)
	(cd kafka && make build)
	(cd spring-xd-base && make build)
	(cd spring-xd-admin && make build)
	(cd spring-xd-container && make build)
	(cd spring-xd-hsqldb && make build)
	(cd spring-xd-shell && make build)
	(cd spring-xd-zookeeper && make build)

push-images:
	(cd hyperkube && make push)
	(cd kafka && make push)
	(cd spring-xd-base && make push)
	(cd spring-xd-admin && make push)
	(cd spring-xd-container && make push)
	(cd spring-xd-hsqldb && make push)
	(cd spring-xd-shell && make push)
	(cd spring-xd-zookeeper && make push)
	
deploy-k8s:
	$(compose) -f k8s.yml up -d

deploy-k8s-ec2:
	aws cloudformation create-stack --stack-name kubernetes-dev --region eu-central-1 \
				--template-body file://k8s-ec2-cloudformation.json \
				--parameters ParameterKey=KeyPair,ParameterValue=riox-ec2 \
             ParameterKey=SubnetId,ParameterValue=subnet-22b2494b \
             ParameterKey=SubnetAZ,ParameterValue=eu-central-1a \
             ParameterKey=VpcId,ParameterValue=vpc-8c6295e5

undeploy-k8s-ec2:
	aws cloudformation delete-stack --stack-name kubernetes-dev

deploy-k8s-ec2:
	aws cloudformation create-stack --stack-name kubernetes-dev --region eu-central-1 \
				--template-body file://k8s-ec2-cloudformation.json \
				--parameters ParameterKey=KeyPair,ParameterValue=riox-ec2 \
             ParameterKey=SubnetId,ParameterValue=subnet-22b2494b \
             ParameterKey=SubnetAZ,ParameterValue=eu-central-1a \
             ParameterKey=VpcId,ParameterValue=vpc-8c6295e5

undeploy-k8s-ec2:
	aws cloudformation delete-stack --stack-name kubernetes-dev

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
#	(cd spring-xd-admin && make deploy)
#	(cd spring-xd-container && make deploy)
#	(cd spring-xd-hsqldb && make deploy)

undeploy-services: 
#	(cd spring-xd-admin && make undeploy)
#	(cd spring-xd-container && make undeploy)
	(cd kafka && make undeploy)
	(cd spring-xd-zookeeper && make undeploy)
#	(cd spring-xd-hsqldb && make undeploy)
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
