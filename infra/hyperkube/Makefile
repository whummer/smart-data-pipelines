VERSION=v0.16.2
IMAGE=riox/hyperkube

all: clean build push

build:
	wget -nc https://storage.googleapis.com/kubernetes-release/release/${VERSION}/bin/linux/amd64/hyperkube
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

clean:
	rm hyperkube


.PHONY: build push all clean
