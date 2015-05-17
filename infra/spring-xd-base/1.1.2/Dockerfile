FROM java:8
MAINTAINER riox 

# 'snapshot' or 'release'
ENV XD_BUILD release
ENV XD_VERSION 1.1.2.RELEASE

RUN groupadd -r springxd && useradd -r -g springxd springxd

RUN wget http://repo.spring.io/${XD_BUILD}/org/springframework/xd/spring-xd/${XD_VERSION}/spring-xd-${XD_VERSION}-dist.zip \
      -O /opt/spring-xd-${XD_VERSION}-dist.zip \
    && unzip /opt/spring-xd-${XD_VERSION}-dist.zip -d /opt/ \
    && rm /opt/spring-xd-${XD_VERSION}-dist.zip \
    && apt-get update && apt-get install -y rsync \
    && /opt/spring-xd-${XD_VERSION}/zookeeper/bin/install-zookeeper \
    && chown -R springxd:springxd /opt/spring-xd-${XD_VERSION} \
    && ln -s /opt/spring-xd-${XD_VERSION} /opt/spring-xd

RUN chown -R springxd:springxd /opt/spring-xd-${XD_VERSION}

# add custom modules into container filesystem
ADD source-http-singleton.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/source/http-singleton.jar
ADD sink-websocket.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/sink/websocket.jar
ADD analytics-geofence-1.0.0.BUILD-SNAPSHOT.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/processor/analytics-geofence.jar
ADD analytics-moving-functions-1.0.0.BUILD-SNAPSHOT.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/processor/analytics-moving-functions.jar

# make sure that often-used libs are in global XD lib and not in local module lib folders
# https://jira.spring.io/browse/XD-1440
RUN mv /opt/spring-xd-${XD_VERSION}/xd/modules/sink/kafka/lib/* /opt/spring-xd-${XD_VERSION}/xd/lib/
RUN mv /opt/spring-xd-${XD_VERSION}/xd/modules/source/kafka/lib/* /opt/spring-xd-${XD_VERSION}/xd/lib/

USER springxd
WORKDIR /opt/spring-xd
