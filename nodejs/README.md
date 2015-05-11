# Riox Developer Guide


## Prerequisites

* Node JS 0.12.x
* Docker v1.6.0 (it is important to have no version lower than this)
* [docker-compose](https://docs.docker.com/compose/install/) 
* [make](http://www.gnu.org/software/make/manual/make.html)
* Boot2docker with at least 4GB or RAM if you are using a Mac. 

We assume that all the command below, are executed in the folder where this README.md is located. 

#### Build all images locally

This way you have them in the cache and Kubernetes does not need to download them from the registry.

```sh
(cd ../infra && make build-images)
```

#### Create a Kubernetes config file in `.kube/.kubconfig` 

```sh
mkdir ~/.kube
cat <<EOT >> ~/.kube/.kubeconfig 
apiVersion: v1
clusters:
- cluster:
    server: http://localhost:8080
  name: local
contexts:
- context:
    cluster: local
    namespace: dev
    user: ""
  name: dev
current-context: dev
kind: Config
preferences: {}
users: []
EOT
```

#### Bring up the base Kubernetes environment

```sh
(cd ../infra && make deploy-k8s)
```

At this point, you should have a running Kubernetes cluster. Test it out by installing the `kubectl` binary: 
([OS X](https://storage.googleapis.com/kubernetes-release/release/v0.16.2/bin/darwin/amd64/kubectl))
([Linux](https://storage.googleapis.com/kubernetes-release/release/v0.16.2/bin/linux/amd64/kubectl))


*Note:*
On OS/X you will now need to set up port forwarding via ssh (and leave that shell open):

```sh
boot2docker ssh -L8080:localhost:8080
```

#### Deploy the Kubernetes DNS servers

```sh
(cd ../infra && make deploy-k8s-dns)
```

List the nodes in your cluster by running::

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
kubectl get pods --namespace=default
```

This should print:
```
POD              IP        CONTAINER(S)         IMAGE(S)                                         HOST           LABELS                                                              STATUS    CREATED      MESSAGE
k8s-master-127                                                                                   127.0.0.1/     <none>                                                              Running   51 seconds   
                           apiserver            riox/hyperkube:v0.16.2                                                                                                        Running   3 minutes    
                           controller-manager   riox/hyperkube:v0.16.2                                                                                                        Running   3 minutes    
                           scheduler            riox/hyperkube:v0.16.2                                                                                                        Running   3 minutes    
kube-dns-3paal                                                                                   <unassigned>   k8s-app=kube-dns,kubernetes.io/cluster-service=true,name=kube-dns   Pending   47 seconds   
                           etcd                 quay.io/coreos/etcd:v2.0.3                                                                                                                    
                           kube2sky             gcr.io/google_containers/kube2sky:1.2                                                                                                         
                           skydns               gcr.io/google_containers/skydns:2015-03-11-001     
```

Check the DNS service with: 
```sh
kubectl get services --namespace=default
```

This should print:
```
NAME            LABELS                                                              SELECTOR           IP           PORT(S)
kube-dns        k8s-app=kube-dns,kubernetes.io/cluster-service=true,name=kube-dns   k8s-app=kube-dns   10.0.0.100   53/UDP
kubernetes      component=apiserver,provider=kubernetes                             <none>             10.0.0.2     443/TCP
kubernetes-ro   component=apiserver,provider=kubernetes                             <none>             10.0.0.1     80/TCP
```

#### Deploy all services required by Riox

```sh
(cd ../infra && make deploy-services)
```

In case you want to undeploy all services:
```sh
(cd ../infra && make undeploy-services)
```


# Build the code

TBD

# Run the code

TBD
 

# Run the e2e tests

Our e2e tests run in a docker image `riox/nodejs-base:latest` that is automatically built by
our CI infrastructure. The following command starts within a docker container to have access to 
all the Kubernetes services via DNS. You can manually create and upload one with the `build` and `push
targets in the `Makefile`.

```sh
make run-e2e-test [TEST_TIMEOUT=--no-timeouts]
```

You should see all the tests passing. If you get a timeout error, re-run the command with the 
optional `TEST_TIMEOUT=--no-timeouts` argument. If this does also not help, please file an issue.

If you need to debug, you can run an XD Shell as follows:
```sh
make run-xd-shell
```

Then follow the instructions on the screen to connect to the XD admin. You should be able to see
all the streams that were created during the test.


# FAQ

#### DNS resolution does not seem to work. 

For some reason the `kube2sky` control loop is hanging. The only way that I found is to restart the container. A brute force way is the following:

```sh
docker ps | grep kube2sky | awk -F' ' '{ print $1 }' | xargs docker restart
```

#### How do I use NFS with boot2docker?

Our tests use file mounts in docker (`-v` flag), which is awefully slow per with `vboxfs`. There is a simple script that
runs NFS in `../infra/bin/boot2docker-use-nfs.sh` that sets up NFS on your Mac and boot2docker and mounts `/Users`. 

*Note*: You have to re-run this script, when you change network locations. Also, since the lookup of the IP to use
is based on the network adapter, as follows, `OSX_IP=$(ifconfig en1 | grep --word-regexp inet | awk '{print $2}')`, you
may have to manually tweak this if you are not using `en1` (aka WIFI).
