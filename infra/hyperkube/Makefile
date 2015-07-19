# build the hyperkube image.

VERSION=v1.0.0
IMAGE=riox/hyperkube

all: clean build push

build:
	wget -nc https://storage.googleapis.com/kubernetes-release/release/${VERSION}/bin/linux/amd64/hyperkube
	sed -i '' "s/VERSION/${VERSION}/g" master-multi.json master.json
	docker build -t ${IMAGE}:${VERSION} .

push:
	docker push ${IMAGE}:${VERSION}

clean:
	rm hyperkube

.PHONY: build push all clean
