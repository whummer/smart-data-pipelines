# Riox Developer Guide


## Prerequisites

* Node JS 0.12.x
* Docker v1.6.0 (it is important to have no version lower than this)
* [docker-compose](https://docs.docker.com/compose/install/) 
* We assume that all the command below, are executed in the folder where this README.md is located. 


## Setup Kubernetes environment for development


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
docker-compose -f ../infra/k8s.yml up -d
```

At this point, you should have a running Kubernetes cluster. Test it out by installing the `kubectl` binary: 
([OS X](https://storage.googleapis.com/kubernetes-release/release/v0.16.2/bin/darwin/amd64/kubectl))
([Linux](https://storage.googleapis.com/kubernetes-release/release/v0.16.2/bin/linux/amd64/kubectl))

*Note:*
On OS/X you will need to set up port forwarding via ssh (and leave that shell open):
```sh
boot2docker ssh -L8080:localhost:8080
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


#### Deploy DNS for Kubernetes

```sh
../infra/deploy-dns.sh
```

You can check whether the DNS server has been deployed with `kubectl get pods,service --namespace=default` 


#### Deploy all services required by Riox

```sh
../infra/deploy-dev-env.sh
```

In case you want to undeploy all services:
```sh
../infra/destroy-dev-env.sh
```


# Build the code

TBD

# Run the code

TBD
 

# Run the tests

Build a test image with the following command (This process needs to be improved in terms of speed as discussed in [Issue 190](https://github.com/riox/riox/issues/190)): 
```
$ ./bin/build-e2e-image.sh 
```

Execute all the integration tests
```
$ ./bin/run-e2e-tests.sh [--no-timeouts]
```

You should see them passing. If you get a timeout error, re-run the command with the `--no-timeouts` arguments. 
If this does also not help, please file an issue.

