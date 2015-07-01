FROM riox/nodejs:0.12.2
MAINTAINER Waldemar Hummer

RUN	apt-get -y update
RUN	apt-get -y install wget git
RUN	git clone git://github.com/etsy/statsd.git statsd
RUN	npm install -g mongo-statsd-backend@0.0.6

ADD	./config.js ./statsd/config.js

EXPOSE 8125/udp
EXPOSE 8126/tcp

CMD	/usr/local/bin/node ./statsd/stats.js ./statsd/config.js
