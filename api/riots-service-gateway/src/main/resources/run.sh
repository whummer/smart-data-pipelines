#!/bin/sh

# rebuild the container
docker build -t riots/${project.artifactId} .

# link to eureka and run the container. adapt port and container name.
docker run --rm -i -t -p ${riots.port}:${riots.port} --link eureka:eureka --name ${project.artifactId} riots/${project.artifactId}