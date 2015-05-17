VERSION=1.1.2
IMAGE=riox/springxd-shell

all: build push

build:
	docker build -t ${IMAGE}:${VERSION} ${VERSION}

push:
	docker push ${IMAGE}:${VERSION}

run:
	docker run --dns=10.0.0.100 -it riox/springxd-shell:1.1.2

.PHONY: build push all run
