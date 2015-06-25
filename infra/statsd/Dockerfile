FROM	riox/nodejs-base:0.12.2
MAINTAINER Waldemar Hummer

#RUN	echo "deb http://archive.ubuntu.com/ubuntu quantal main universe" > /etc/apt/sources.list
#RUN	apt-get -y update
#RUN	apt-get -y install wget git python
#RUN	wget -O /tmp/node-v0.12.5.tar.gz http://nodejs.org/dist/v0.12.5/node-v0.12.5-linux-x64.tar.gz
#RUN	tar -C /usr/local/ --strip-components=1 -zxvf /tmp/node-v0.12.5.tar.gz
#RUN	rm /tmp/node-v0.12.5.tar.gz

RUN	apt-get -y update
RUN	apt-get -y install wget git
RUN	git clone git://github.com/etsy/statsd.git statsd
RUN	npm install -g mongo-statsd-backend@0.0.6

ADD	./config.js ./statsd/config.js

EXPOSE	8125/udp
EXPOSE	8126/tcp

CMD	/usr/local/bin/node ./statsd/stats.js ./statsd/config.js

