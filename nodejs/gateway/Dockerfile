# This file describes how to build Riox Gateway into a runnable linux container with
# all dependencies installed.
#
# To build:
#
# 1) Install docker (http://docker.io)
# 2) Build: cd gateway && docker build .
# 3) Run: docker run -d --name redis redis
# 4) Run: docker run -d --link redis:redis -P <riox-gateway-image-id>
#
# See the documentation for more details about how to operate the Riox Gateway.

# Latest Ubuntu LTS
FROM ubuntu:14.04

RUN apt-get -y update && apt-get -y install curl python build-essential
RUN curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
RUN apt-get -y install nodejs

# This is provisional, as we don't honor it yet in Riox Gateway
ENV NODE_ENV production
ENV RGW_DIR /opt/riox-gateway

# Manually add Riox Gateway folder
RUN mkdir -p ${RGW_DIR}

# Copy ONLY package.json b/c docker has issues with cashing and will
# re-run npm install as other files may  have changed
ADD ./package.json ${RGW_DIR}/package.json
ADD ./ext ${RGW_DIR}/ext
WORKDIR ${RGW_DIR}

# this will issues two warnings during the build which can be ignored
RUN npm install --production 

# Add all other files
ADD . ${RGW_DIR}

# Create Riox Gatway log directory
RUN mkdir -p /var/log/riox

EXPOSE  80

# Start supervisor
CMD [ "/opt/riox-gateway/bin/rgw", "-c", "/opt/riox-gateway/config/config-production.json" ]
