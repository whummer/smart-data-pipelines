#!/bin/bash
set -ex

DOCKER_REGISTRY="10.240.183.174:5000"
#
# retag with custom registry and push
#

declare -a IMAGES=("riots/service-catalog"\
	    "riots/service-environment"\
	    "riots/service-simulation"\
	    "riots/service-users"\
	    "riots/service-gateway"\
	    "riots/service-files"\
	    "riots/service-docs"\
	    "riots/service-eureka"\
        "riots/webapp")

for image in "${IMAGES[@]}"
do
	docker tag -f $image ${DOCKER_REGISTRY}/$image
	docker push ${DOCKER_REGISTRY}/$image
done