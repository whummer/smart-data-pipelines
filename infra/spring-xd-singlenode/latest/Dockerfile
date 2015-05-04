FROM riox/springxd-base
MAINTAINER riox

RUN mkdir -p /tmp/xd/output
RUN mkdir -p /tmp/xd/input
RUN chown springxd /tmp/xd/output
RUN chown springxd /tmp/xd/input

ADD config/servers.yml  /opt/spring-xd/xd/config/servers.yml

CMD ["xd/bin/xd-singlenode"]
EXPOSE 9393
