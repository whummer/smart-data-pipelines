VERSION=0.12.2
IMAGE=riox/nodejs

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

.PHONY: build push all
