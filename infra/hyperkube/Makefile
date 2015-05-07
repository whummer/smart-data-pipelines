# build the hyperkube image.

VERSION=v0.16.2

build:
	curl -O https://storage.googleapis.com/kubernetes-release/release/${VERSION}/bin/linux/amd64/hyperkube
	docker build -t riox/hyperkube:${VERSION} .

push:
	docker push riox/hyperkube:${VERSION}

all: clean build push

clean:
	rm hyperkube


.PHONY: build push all clean
