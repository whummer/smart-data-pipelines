FROM node:0.12.2
MAINTAINER riox
MAINTAINER Waldemar Hummer

# install prerequisites
RUN npm install -g gulp mocha nodemon linklocal node-gyp

# change workdir
WORKDIR /code/

# set environment (for lookup of global node modules)
ENV NODE_PATH /usr/local/lib/node_modules/

# TODO: whu: temporary fix: gd.tuwien.ac.at is currently not working :/
RUN sed -i s/httpredir.debian.org/debian.mirror.lrz.de/g /etc/apt/sources.list

# install some commonly used tools inside the container
RUN apt-get update -y && apt-get install -y --force-yes vim nano less

# install all deps required to make a gulp run
ADD ./gulpfile.js ./package.json /code/
RUN npm install --ignore-scripts

# add package.json files to prepare npm install
ADD ./bin/ /code/bin/
ADD ./gateway/package.json /code/gateway/
ADD ./gateway/ext/http-proxy/package.json /code/gateway/ext/http-proxy/
ADD ./services/riox-services-base/package.json /code/services/riox-services-base/
ADD ./services/files-service/package.json /code/services/files-service/
ADD ./services/users-service/package.json /code/services/users-service/
ADD ./services/pipes-service/package.json /code/services/pipes-service/
ADD ./services/access-service/package.json /code/services/access-service/
ADD ./services/gateway-service/package.json /code/services/gateway-service/
ADD ./services/pricing-service/package.json /code/services/pricing-service/
ADD ./services/analytics-service/package.json /code/services/analytics-service/
ADD ./services/test/package.json /code/services/test/
ADD ./riox-shared/package.json /code/riox-shared/
ADD ./web-ui/package.json /code/web-ui/

# now install all other modules (global flag on: -g)
RUN gulp deps:install:global

# fix: kafka-node needs to be installed separately
RUN npm install -g kafka-node

# install bower dependencies
ADD ./web-ui/bower.json /code/web-ui/
ADD ./riox-shared/bower.json /code/riox-shared/
ADD ./web-ui/*gulpfile.js /code/web-ui/
RUN gulp ui:bower

# now add entire code dir
ADD . /code

# clean up
RUN rm -rf `find . -name node_modules | grep -v '^\./node_modules'`
RUN rm -rf ./web-ui/build/production/

# set config to use link-local before running npm install
RUN echo '{"build":{"linklocal":true}}' > /root/.rioxrc

# link local deps
RUN gulp deps:clean:local
RUN npm install --unsafe-perm
RUN gulp ui:bower

CMD ["/bin/bash"]
