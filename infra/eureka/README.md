# Eureka Dockerfile

This project contains a Dockerfile for building an image containing the following software:
 1. [Eureka Server](https://github.com/Netflix/eureka/wiki)
 2. [Hystrix Dashbaord](https://github.com/Netflix/Hystrix/wiki/Dashboard)

Both are deployed as WAR files in Tomat 8.


## Building the image

Run the following in the directory where the Dockerfile is located:

   `$ docker build -t riox/eureka .`

This will build the container locally. 


## Run the container

   `$ docker run -d -p 10000:80 --name eureka riox/eureka`

 This will setup port forwarding from 10000 on the host to 80 on the container. Port 10000
 is what we use for dev & test. The `-d` option will run the container as a daemon. If you
 want to see the tomcat output you can substitute `-p` by `-i -t`.
