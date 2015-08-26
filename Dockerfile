FROM node:0.12.7-slim
MAINTAINER riox
MAINTAINER Waldemar Hummer

# change workdir
WORKDIR /code/

# set environment (for lookup of global node modules)
ENV NODE_PATH /usr/local/lib/node_modules/

# TODO: whu: temporary fix: gd.tuwien.ac.at is currently not working :/
#RUN sed -i s/httpredir.debian.org/debian.mirror.lrz.de/g /etc/apt/sources.list

	# install some commonly used tools inside the container
RUN apt-get update -y && apt-get install -y --force-yes vim && \

	# install tools needed to fetch dependencies and compile native extensions
	apt-get install -y python git make g++ && \

	# clean up docs/man pages
	rm -rf /usr/share/doc /usr/share/man/

# install prerequisites
ADD ./Makefile /code/
RUN make install-prereq && \

	# clean up npm cache
	rm -rf /root/.cache /root/.npm /tmp/*

# add files required to make a gulp run
ADD ./gulpfile.js ./package.json /code/

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

	# now install all other node modules (global flag on: -g)
RUN gulp deps:install:global && \

	# clean up npm cache
	rm -rf /root/.cache /root/.npm /tmp/*

# install bower dependencies
ADD ./riox-shared/bower.json /code/riox-shared/
ADD ./web-ui/bower.json /code/web-ui/
ADD ./web-ui/*gulpfile.js /code/web-ui/
ADD ./web-ui/.bowerrc /code/web-ui/
RUN gulp ui:bower && rm -rf /root/.cache /tmp/*

# clean up
#RUN apt-get purge -y git make g++ gcc python perl

# now add code dirs
ADD ./services/ /code/services/
ADD ./web-ui/ /code/web-ui/
ADD ./gateway/ /code/gateway/
ADD ./riox-shared/ /code/riox-shared/

	# finish up
RUN rm -rf `find . -name node_modules` && \
	rm -rf ./web-ui/build/production/ && \

	# set config to use link-local before running npm install
	echo '{"build":{"linklocal":true}}' > /root/.rioxrc && \

	# link local deps && \
	gulp deps:clean:local && \
	node bin/preinstall.js && \
	gulp ui:bower

CMD ["/bin/bash"]