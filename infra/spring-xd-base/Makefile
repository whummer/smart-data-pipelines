VERSION=1.2.1
IMAGE=riox/springxd-base
MODULE_PROCESSOR_TIMESERIES=../../springxd/processors/timeseries/release/processor-timeseries.tgz

all: build push

add-modules:
	(test -f ${MODULE_PROCESSOR_TIMESERIES} && cp ${MODULE_PROCESSOR_TIMESERIES} ${VERSION}/) || :
	test -f ${VERSION}/`basename ${MODULE_PROCESSOR_TIMESERIES}` || (echo "ERROR: You need to build release of module ${MODULE_PROCESSOR_TIMESERIES} first" && exit 1)

build: add-modules
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

.PHONY: build push all add-modules
