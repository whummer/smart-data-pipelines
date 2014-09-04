#!/bin/sh

# rebuild the container
docker build -t ${project.artifactId} .

# link to eureka and run the container. adapt port and container name.
docker run -i -t -p ${riots.port}:${riots.port} --link eureka:eureka --name ${project.artifactId} omoser/riots-base