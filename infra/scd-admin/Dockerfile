FROM delitescere/jdk
MAINTAINER riox <dev@riox.io>

ENV SCSD_VERSION 1.0.0.BUILD-SNAPSHOT

RUN apk add --update \
		python \
		py-pip \
		&& pip install awscli \
		&& rm -rf /var/cache/apk/*

# install Spring Cloud Stream Dataflow
ADD jar/*.jar /opt/spring-dataflow/admin.jar
RUN mkdir /opt/spring-dataflow/riox-scripts

# add aws config
ADD aws-config /root/.aws/config

# Add start scripts
ADD common-config.sh /common-config.sh
ADD start-admin-k8s.sh /start-admin-k8s.sh
ADD start-admin-local.sh /start-admin-local.sh

# add cronjobs for synching the scripts
RUN crontab -l | { cat; echo "*/1 * * * * /usr/local/bin/aws s3 sync s3://riox-scripts /opt/spring-dataflow/riox-scripts"; } | crontab -

# Alpine Linux doesn't use pam, which means that there is no /etc/nsswitch.conf,
# but Java relies on /etc/nsswitch.conf to check the order of DNS resolving
# (i.e. check /etc/hosts first and then lookup DNS-servers).
# To fix this we just create /etc/nsswitch.conf and add the following line:
RUN echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf

WORKDIR /opt/spring-dataflow
EXPOSE 8080
