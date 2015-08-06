FROM debian:wheezy
MAINTAINER riox <dev@riox.io>

# 'snapshot' or 'release'
ENV XD_BUILD release
ENV XD_VERSION 1.2.1.RELEASE

RUN apt-get update && \
    apt-get install -y wget tar unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Java8
RUN wget --no-cookies \
         --no-check-certificate \
         --header "Cookie: oraclelicense=accept-securebackup-cookie" \
         "http://download.oracle.com/otn-pub/java/jdk/8u51-b16/server-jre-8u51-linux-x64.tar.gz" \
         -O /tmp/jdk-8-linux-x64.tar.gz \
   && mkdir /opt/java-oracle \
   && tar -zxf /tmp/jdk-8-linux-x64.tar.gz -C /opt/java-oracle \
   && export JAVA_HOME=/opt/java-oracle/jdk1.8.0_51 \
   && update-alternatives --install /usr/bin/java java ${JAVA_HOME}/bin/java 20000 \
   && update-alternatives --install /usr/bin/javac javac ${JAVA_HOME}/bin/javac 20000 \
   && rm -rf /tmp/* /var/tmp/*

# install Spring XD
RUN groupadd -r springxd && useradd -r -g springxd springxd \
    && wget http://repo.spring.io/${XD_BUILD}/org/springframework/xd/spring-xd/${XD_VERSION}/spring-xd-${XD_VERSION}-dist.zip \
      -O /opt/spring-xd-${XD_VERSION}-dist.zip \
    && unzip /opt/spring-xd-${XD_VERSION}-dist.zip -d /opt/ \
    && rm /opt/spring-xd-${XD_VERSION}-dist.zip \
    && chown -R springxd:springxd /opt/spring-xd-${XD_VERSION} \
    && ln -s /opt/spring-xd-${XD_VERSION} /opt/spring-xd \
    && chown -R springxd:springxd /opt/spring-xd-${XD_VERSION}

# install elasticsearch-sink into container
RUN	wget --no-check-certificate https://github.com/riox/elasticsearch-sink/raw/master/release/elasticsearch-sink.tgz \
		-O /tmp/elasticsearch-sink.tgz \
	&& (cd /tmp && tar xfz elasticsearch-sink.tgz) \
	&& cp -r /tmp/xd/ /opt/spring-xd-${XD_VERSION}/ \
	&& rm -r /tmp/*


# Add custom modules into container filesystem
ADD source-http-singleton.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/source/http-singleton.jar
ADD sink-websocket.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/sink/websocket.jar
ADD analytics-geofence-1.0.0.BUILD-SNAPSHOT.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/processor/analytics-geofence.jar
ADD analytics-moving-functions-1.0.0.BUILD-SNAPSHOT.jar /opt/spring-xd-${XD_VERSION}/xd/custom-modules/processor/analytics-moving-functions.jar

# Add mysql connector
RUN wget "http://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.36.zip" \
    -O /tmp/mysql-connector-java-5.1.36.zip \
    && unzip /tmp/mysql-connector-java-5.1.36.zip -d /tmp \
    && mv /tmp/mysql-connector-java-5.1.36/mysql-connector-java-5.1.36-bin.jar /opt/spring-xd/xd/lib \
    && rm -rf /tmp/* /var/tmp/*

# 1. Make sure that often-used libs are in global XD lib: https://jira.spring.io/browse/XD-1440
# 2. Cleanup
RUN mv /opt/spring-xd-${XD_VERSION}/xd/modules/sink/kafka/lib/* /opt/spring-xd-${XD_VERSION}/xd/lib/ && \
    mv /opt/spring-xd-${XD_VERSION}/xd/modules/source/kafka/lib/* /opt/spring-xd-${XD_VERSION}/xd/lib/ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

    # Add start scripts
ADD common-config.sh /common-config.sh
ADD start-admin.sh /start-admin.sh
ADD start-container.sh /start-container.sh

USER springxd
WORKDIR /opt/spring-xd

EXPOSE 9393 9000 9001 9002
