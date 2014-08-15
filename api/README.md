# Development

This section describes how to deploy our infrastructure for dev & test. At some point we will have a script
to orchestrate the deployment but for now a few manual commands will do.

## Prerequisites

We leverage docker.io, so a docker intallation on the dev machine is necessary. If you are using a Mac,
we suggest to use boot2docker. It is based on VirtualBox, so you will need forwarding rules to access
any service via localhost (more below).


## Core Service Deployment

For a successful deployment we need two supporting service: MongoDB and Netflix Eureka (which we co-deploy
with the Hystrix dashboard).

1. Deploy MongoDB

    docker run -d -p 27017:27017 --name mongodb dockerfile/mongodb mongod

2. (For boot2docker only) Portforwarding for MongoDB

    VBoxManage controlvm boot2docker-vm natpf1 "mongodb,tcp,127.0.0.1,27017,,27017"

Test this:

    $ curl localhost:27017

Should result in:

    It looks like you are trying to access MongoDB over HTTP on the native driver port.

    
3. Deploy Netflix Eureka

    docker run -i -t -p 10000:80 --name eureka riox/eureka 

This deploys a Eureka instance in a container and exposes port 10000. Port 80 is often occupied 
so we leverge this port for dev & test environment. Docker will download the docker image
from the repo riox/eureka upon first run, then it will start the container. 
Eureka has quite a long startup time so be patient (approx. 2-3min).
Ensure that you setup a port forwarding rule in VirtualBox if you are using boot2docker. 


4. (For boot2docker only) Portforwarding for Eureka

    VBoxManage controlvm boot2docker-vm natpf1 "eureka,tcp,127.0.0.1,10000,,10000"

5. Test Eureka

   Point your browser to [http://localhost:10000/eureka]

You should see the Eureka page with only the EUREKA host itself being registered. 


6. Test Hystrix Dashboard

   Point your browser to [http://localhost:10000/hystrix-dashboard]


# Micro Service Deployment

TBD for more details on how to launch this with mvn. In the meantime try this:

For now, just launch the catalog-service/src/java/com/viotualize/catalog-service/CatalogServiceStarter and 
the smartobject-service/src/java/com/viotualize/smo/SmartobjectStarter. Both will register in Eureka and 
you can test the following cURL command. It won't create anything but you should see the Catalog service 
call the other service through a hystrix command using the Ribbon client side loadbalancers.
