#!/bin/bash
set -ex

REGISTRY=146.148.126.222:5000

#
# retag with custom registry and push
#

declare -a IMAGES=("riots/service-catalog"\
	    "riots/service-environment"\
	    "riots/service-simulation"\
	    "riots/service-users"\
	    "riots/service-gateway"\
        "riots/webapp")

for image in "${IMAGES[@]}"
do
	docker tag -f $image $REGISTRY/$image
	docker push $REGISTRY/$image
done