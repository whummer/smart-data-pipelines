# Riox Developer Guide


*IMPORTANT: Please read carefully esp. if you have read it before as things
change quickly (e.g., Kubernetes upgrade from v0.16 to v1.0.0).*

## Prerequisites

* Node JS 0.12.x
* Docker v1.6.0 (it is important to have no version lower than this)
* [docker-compose](https://docs.docker.com/compose/install/)
* [make](http://www.gnu.org/software/make/manual/make.html)
* Boot2docker with at least 4GB or RAM if you are using a Mac.

We assume that all the command below, are executed in the folder where this README.md is located.


## Local Kubernetes Setup

This section shows how to setup a minimal Kubernetes cluster based on Docker
that runs all third party services including DNS.

#### Build all images locally

This way you have them in the cache and Kubernetes does not need to download them from the registry.

```sh
(cd ../infra && make build-images)
```

#### Create a Kubernetes config file in `.kube/config`

```sh
cp ../infra/cluster/kubeconfig ~/.kube/config
```

This contains both, the Kubernetes config for local development and the AWS
cluster access.

#### Bring up the base Kubernetes environment

```sh
(cd ../infra && make deploy-k8s)
```

At this point, you should have a running Kubernetes cluster. Test it out by installing the `kubectl` binary (*Important*: you need kubectl version 1.0.0. Please update if you come from a previous version.)
([OS X](https://storage.googleapis.com/kubernetes-release/release/v1.0.0/bin/darwin/amd64/kubectl))
([Linux](https://storage.googleapis.com/kubernetes-release/release/v1.0.0/bin/linux/amd64/kubectl))


*Note:*
On OS/X you will now need to set up port forwarding via ssh (and leave that shell open):

```sh
boot2docker ssh -L8080:localhost:8080
```

#### Deploy the Kubernetes DNS servers

```sh
(cd ../infra && make deploy-k8s-dns)
```

List the nodes in your cluster by running:

```sh
kubectl get nodes
```

This should print:
```
NAME        LABELS    STATUS
127.0.0.1   <none>    Ready
```

You can also see if the DNS server POD is already running (it may be 'pending' as it is pulling some images
the first time it is started).

```sh
kubectl get pods --namespace=kube-system
```

This should print:
```
riox@rioxs-macbook-pro:~/Code/riox/develop/infra$ kubectl get pods --namespace=kube-system
NAME                READY     STATUS    RESTARTS   AGE
kube-dns-v8-4g56n   2/2       Running   0          9h
```

Check the DNS service with:
```sh
kubectl get services --namespace=kube-system
```

This should print:
```
NAME       LABELS                                                                           SELECTOR           IP(S)        PORT(S)
kube-dns   k8s-app=kube-dns,kubernetes.io/cluster-service=true,kubernetes.io/name=KubeDNS   k8s-app=kube-dns   10.0.0.100   53/UDP
                                                                                                                           53/TCP
```

#### Deploy all third-party services required by Riox

```sh
(cd ../infra && make deploy-services)
```

In case you want to undeploy all services:
```sh
(cd ../infra && make undeploy-services)
```

#### Test the DNS name resolution from you workstation

Run the following script to see if your DNS resolution works from your
workstation.
```sh
./bin/validate-dev-env.sh
```

If you are running OS X and boot2docker, you need to set a route to access
the Kubernetes services incl. DNS directly:

```sh
sudo route -n add 10.0.0.0/16 192.168.59.103
```

This assumes that `192.168.59.103` is your host-only NIC in Virtualbox.
You can validate this by running `boot2docker ssh ifconfig eth1`.

## Build the code

TBD

## Run the code

TBD


## Run the e2e tests

*This section is outdated. Will be updated shortly.*

Our e2e tests run in a docker image `riox/nodejs-base:latest` that is automatically built by
our CI infrastructure. The following command starts within a docker container to have access to
all the Kubernetes services via DNS. You can manually create and upload one with the `build` and `push
targets in the `Makefile`.

```sh
make run-e2e-test [TEST_TIMEOUT=--no-timeouts]
```

You should see all the tests passing. If you get a timeout error, re-run the command with the
optional `TEST_TIMEOUT=--no-timeouts` argument. If this does also not help, please file an issue.


## AWS Cluster Setup & Access

TBD

## Coding Guidelines

In general we stick to common best practices. There are many good articles, blog posts as well as books out there that deal with idiomatic JavaScript, do's and dont's and performance related hints. For instance Doug Crockford's [JavaScript: The good parts](http://javascript.crockford.com/) or [Secrets of the JavaScript Ninja](https://www.manning.com/books/secrets-of-the-javascript-ninja) are worthwhile resources.

However, books, articles or blog posts are not something that you can provide developers with and make them stick to every recommendation that they can find in there. Different sources might even deal with the same issue in conflicting ways. Therefore, we did a little research and found some very comprehensive, easy to read and understand, as well as up-to-date JavaScript coding guidelines at the guys at [rangle.io](http://rangle.io).

*TL;DR*: Stick to the [rangle.io JavaScript coding guidelines](http://rangle.io/guidelines/)

### JavaScript gotchas

#### Promises
[ES6 Promise Antipatterns](http://www.datchley.name/promise-patterns-anti-patterns/)
[Bluebird Promise Antipatterns](https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns)
