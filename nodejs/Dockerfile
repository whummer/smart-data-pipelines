FROM node:0.12.2
MAINTAINER riox

ADD . /code
WORKDIR /code

RUN rm -rf `find . -name node_modules`

# install binaries: gulp, mocha
RUN npm install -g gulp mocha nodemon

# install all deps required to make a gulp run
RUN npm install --ignore-scripts

# install bower dep
RUN gulp ui:bower

# now install all other modules (global flag on: -g)
RUN gulp deps:install:global

# install some commonly used tools inside the container
RUN apt-get update -y && apt-get install -y --force-yes vim nano less

# clean up
RUN rm -rf /code

# set environment (for lookup of global node modules)
ENV NODE_PATH /usr/local/lib/node_modules/

CMD ["/bin/bash"]
