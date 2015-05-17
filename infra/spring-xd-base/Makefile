VERSION=1.1.2
IMAGE=riox/springxd-base

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

.PHONY: build push all 
