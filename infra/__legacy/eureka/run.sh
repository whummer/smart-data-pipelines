#!/bin/sh

# run the container with port 10000 exposed. Point your browser to http://localhost:10000/eureka
docker run --name eureka -t -i -p 10000:80 riox/eureka
