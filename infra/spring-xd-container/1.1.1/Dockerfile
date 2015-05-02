FROM riox/springxd-base:1.1.1
MAINTAINER Eric Bottard

USER root
COPY start /opt/spring-xd/start
RUN chown springxd:springxd /opt/spring-xd/start
RUN chmod u+x /opt/spring-xd/start
USER springxd
EXPOSE 9000
EXPOSE 9001
EXPOSE 9002
ENV JAVA_OPTS="-XX:PermSize=128M -XX:MaxPermSize=256M"

CMD ["/opt/spring-xd/start"]
