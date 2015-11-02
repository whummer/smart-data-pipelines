#!/bin/sh

. /common-config.sh

java -jar admin.jar \
	--spring.cloud.config.enabled=false \
	--spring.profiles.active=kubernetes \
	--kubernetes.imagePullSecret=rioxregistrykey \
	--kubernetes.usePreBakedImagePerModule=true \
	--kubernetes.imageRepository=riox
