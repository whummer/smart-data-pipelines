# Riox - Smart Data Pipelines

*NOTE: This repository is currently no longer actively maintained.*

## Prerequisites

* `make`
* `npm`
* `docker` (native under Linux or using docker-machine on OSX)

## Installation

Note: The installation instructions are primarily tested under Mac OSX.

First install some prerequisites (e.g., gulp, lua, redx). The following command
will ask for sudo access as it needs to create a code directory under `/opt/redx`:

```
make install-prereq
```

Then download and install all required npm and bower packages:

```
make install
```

## Running

Follow the steps below to spin up the environment locally.

If you are using docker-machine, first set up an SSH tunnel that
allows to forward local kubernetes requests to the VirtualBox machine:

```
make tunnel
```

Start the infrastructure components (in a new terminal):
```
make infra
```

Once the above command has finished successfully, start the services:

```
make services
```

Run the gateway proxy (in a new terminal). This command requires `sudo` access as it
adds an entry to the /etc/hosts file, plus it opens a socket on the protected port 80.

```
make start-gateway
```

Finally, add the address `10.0.0.10` to your DNS nameserver configuration. Under Linux, simply
edit the file `/etc/resolv.conf` and include `nameserver 10.0.0.10`. Under OSX, you need to 
change the network under "System Preferences" to make the DNS nameserver available to the system.
Make sure you can actually resolve and access the host name `mongo.development.svc.cluster.local`:

```
$ curl mongo.development.svc.cluster.local:27017
It looks like you are trying to access MongoDB over HTTP on the native driver port.
```

Point your browser to `http://platform.riox.io` and log in via `test1` password `test123`

## Further Information

1. [Developer Guide](docs/Developing.md)
1. [Release Engineering](docs/Releasing.md)
1. [FAQ](docs/Faq.md)
