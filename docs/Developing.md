# Riox Developer Guide


*IMPORTANT: Please read carefully esp. if you have read it before as things
change quickly.*

## Prerequisites

* Node JS 0.12.x
* Docker v1.6.0 (it is important to have no version lower than this)
* [docker-compose](https://docs.docker.com/compose/install/)
* [make](http://www.gnu.org/software/make/manual/make.html)
* Boot2docker with at least 4GB or RAM if you are using a Mac.

We assume that all the commands below, are executed in the root folder of the
project.


## Local Kubernetes Setup

This section shows how to setup a minimal Kubernetes cluster based on Docker
that runs all third party services including DNS.

#### Build all images locally

This way you have them in the cache and Kubernetes does not need to download them from the registry.

```sh
(cd infra && make build-images)
```

#### Create a Kubernetes config file in `.kube/config`

```sh
cp infra/cluster/kubeconfig ~/.kube/config
```

This contains both, the Kubernetes config for local development and the AWS
cluster access.

#### Setup kubectl

Install the Kubernetes `kubectl` binary (*Important*: you need kubectl version >= 1.0.0. Please update if you come from a previous version.)
([OS X](https://storage.googleapis.com/kubernetes-release/release/v1.0.0/bin/darwin/amd64/kubectl))
([Linux](https://storage.googleapis.com/kubernetes-release/release/v1.0.0/bin/linux/amd64/kubectl))


#### Mac OS requirements

On OS/X you will now need to set up port forwarding via ssh and also open some
ports on the underlying VM that runs docker (virtualbox).

Run the following command in a separate shell and leave it open.

```sh
./infra/bin/virtualbox-k8s-tunnel.sh
```

Run the following commands to setup a route to access the k8s pods from localhost and
some key port forwarding rules for services that we need to expose (such as etcd).

```sh
./infra/bin/virtualbox-portforward.sh
./infra/bin/rirtualbox-route.sh
```

#### Bring up the Kubernetes environment

Run the following utility script:

```
./infra/bin/rioxRestartAll.sh
```

This will setup the whole Riox infrastructure based on Kubernetes for you.
If you want to learn more read the script or execute the steps below to do it
manually.


#### TL;DR Summary


#### Deploy the base Kubernetes enviroment

```sh
(cd infra && make deploy-k8s)
```

#### Deploy the Kubernetes DNS servers


```sh
(cd infra && make deploy-k8s-dns)
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
$ kubectl get pods --namespace=kube-system
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
(cd infra && make deploy-services)
```

In case you want to undeploy all services:
```sh
(cd infra && make undeploy-services)
```

#### Test the DNS name resolution from your workstation

Run the following script to see if your DNS resolution works from your
workstation.
```sh
./infra/bin/validate-dev-env.sh
```

If you are running OS X and boot2docker, you need to set a route to access
the Kubernetes services incl. DNS directly:

```sh
./infra/bin/rirtualbox-route.sh
```

This assumes that `192.168.59.103` is your host-only NIC in Virtualbox.
You can validate this by running `boot2docker ssh ifconfig eth1`.

## Run the code

#### Riox Microservices

If you are just getting started with Riox development, you first need to
install all the NodeJS dependencies.

```sudo make install-prereq```

This will install all required libraries globally.

After that, you need to run:

```
make install
```

This will install all the required libaries for Riox. ***Keep in mind that you
have to re-run this script every time you add third party libraries to our
code or you make changes to the shared libraries (such as in `riox-shared` or
`services/riox-services-base`).

Finally, you need to start all the Riox microservices with:

```
gulp riox
```


#### Riox Gateway

For local development, you need to install Nginx with LUA extension for dynamic
configuration via Redis.

##### One time MacOS setup


```
# Install Lua and Nginx based OpenResty
brew install lua51 # you need this version!
brew install luajit
brew install homebrew/nginx/openresty

# Install Lua modules
luarocks-5.1 install luasocket && \
luarocks-5.1 install ansicolors && \
luarocks-5.1 install luasec 0.4-4 && \
luarocks-5.1 install lua-cjson 2.1.0-1 && \
luarocks-5.1 install busted 1.9.0-1 && \
luarocks-5.1 install lapis 1.0.4-1 && \
luarocks-5.1 install moonscript 0.2.4-1 && \
luarocks-5.1 install inspect 1.2-2 && \
luarocks-5.1 install luajwt 1.3-2

# Checkout Redx - Redis Extension for Nginx
sudo git clone --recursive https://github.com/whummer/redx.git /opt/redx
```

##### One time Linux setup (Debian/Ubuntu)

```
# Install Lua and Nginx based OpenResty
sudo apt-get update
wget https://openresty.org/download/ngx_openresty-1.9.3.1.tar.gz
tar -xvzf ngx_openresty-1.9.3.1.tar.gz
apt-get install libpcre3 libpcre3-dev libssl-dev
(cd ngx_openresty-1.9.3.1 && ./configure && make && sudo make install)
sudo ln -s /usr/local/openresty/nginx/sbin/nginx /usr/bin/openresty

# Install Lua modules
sudo apt-get install luarocks
luarocks install luasocket && \
luarocks install ansicolors && \
luarocks install luasec 0.4-4 && \ # may require: OPENSSL_LIBDIR=/usr/lib/x86_64-linux-gnu/
luarocks install lua-cjson 2.1.0-1 && \
luarocks install busted 1.9.0-1 && \
luarocks install lapis 1.0.4-1 && \
luarocks install moonscript 0.2.4-1 && \
luarocks install inspect 1.2-2 && \
luarocks install luajwt 1.3-2

# Checkout Redx - Redis Extension for Nginx
sudo git clone --recursive https://github.com/whummer/redx.git /opt/redx
```

#### Start the Gateway:

Ensure that you have the Kubernetes infrastructure running and the DNS resolution works.

```
sudo openresty -c <path_to_riox>/infra/nginx/nginx.dev.conf
```

Add the following entry to your `/etc/hosts` file:

```
127.0.0.1       platform.riox.io
```

Now go to `http://platform.riox.io` and you should see the Riox webapp.


## Run the e2e tests

To run the e2e tests locally, we use a separate image `riox/hyperriox-test` which is derived from
the main `riox/hyperriox` image and optimized for fast building.

The base image can be built once, and needs to be updated every time there is a change in 
the npm dependencies:
```
make build-image
```

To build the test image, run (this should build fast and can be repeated for every code change):
```
make build-test-image
```

To run the integration tests, make sure your `kubeconfig config view` points to the local `dev`
environment, then run:
```
make run-integration-tests-local
```

This command creates an integration test pod in your local kubernetes environment. The command 
automatically attaches to the stdout/stderr output of the pod, so you can watch the test output 
as the test runs.

## AWS Cluster Setup & Access

TBD

## Coding Guidelines

In general we stick to common best practices. There are many good articles, blog posts as well as books out there that deal with idiomatic JavaScript, do's and dont's and performance related hints. For instance Doug Crockford's [JavaScript: The good parts](http://javascript.crockford.com/) or [Secrets of the JavaScript Ninja](https://www.manning.com/books/secrets-of-the-javascript-ninja) are worthwhile resources.

However, books, articles or blog posts are not something that you can provide developers with and make them stick to every recommendation that they can find in there. Different sources might even deal with the same issue in conflicting ways. Therefore, we did a little research and found some very comprehensive, easy to read and understand, as well as up-to-date JavaScript coding guidelines at the guys at [rangle.io](http://rangle.io).

*TL;DR*: Stick to the [rangle.io JavaScript coding guidelines](http://rangle.io/guidelines/)

### JavaScript gotchas

#### Promises
* [ES6 Promise Antipatterns](http://www.datchley.name/promise-patterns-anti-patterns/)
* [Bluebird Promise Antipatterns](https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns)
