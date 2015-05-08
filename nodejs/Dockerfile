FROM riox/nodejs:0.12.2
MAINTAINER riox

ADD . /code
WORKDIR /code

# RUN ./bin/bootstrap-node-reqs.sh

RUN rm -rf `find . -name node_modules`

# install binaries: gulp, mocha
RUN npm install -g gulp mocha
RUN gulp -v || exit 1

# install all deps required to make a gulp run
RUN npm install --ignore-scripts

# install bower dep
RUN gulp ui:bower

# now install all other modules (global flag on: -g)
RUN gulp deps:install:global

# install some commonly used tools inside the container
RUN apt-get update -y
RUN apt-get install -y vim nano less

# clean up
RUN rm -rf /code

CMD ["/bin/bash"]
