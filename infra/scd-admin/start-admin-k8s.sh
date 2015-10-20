#!/bin/sh

. /common-config.sh

crond && java -jar admin.jar \
	--spring.profiles.active=kubernetes \
	--kubernetes.imagePullSecret=rioxregistrykey \
	--kubernetes.moduleLauncherImage=riox/spring-stream-module-launcher
