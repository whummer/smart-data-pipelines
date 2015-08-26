FROM debian:wheezy
MAINTAINER riox <dev@riox.io>

# 'snapshot' or 'release'
ENV XD_BUILD release
ENV XD_VERSION 1.2.1.RELEASE
ENV DEBIAN_FRONTEND=noninteractive

RUN sed -i s/httpredir.debian.org/debian.mirror.lrz.de/g /etc/apt/sources.list && \
		apt-get update && \
		apt-get install -y wget tar unzip cron sudo python python-pip && \
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
RUN groupadd -r springxd && useradd -m -r -g springxd springxd \
		&& wget http://repo.spring.io/${XD_BUILD}/org/springframework/xd/spring-xd/${XD_VERSION}/spring-xd-${XD_VERSION}-dist.zip \
			-O /opt/spring-xd-${XD_VERSION}-dist.zip \
		&& unzip /opt/spring-xd-${XD_VERSION}-dist.zip -d /opt/ \
		&& rm /opt/spring-xd-${XD_VERSION}-dist.zip \
		&& chown -R springxd:springxd /opt/spring-xd-${XD_VERSION} \
		&& ln -s /opt/spring-xd-${XD_VERSION} /opt/spring-xd \
		#&& mkdir /opt/spring-xd/riox-modules /opt/spring-xd/riox-scripts \
		&& mkdir /opt/spring-xd/riox-scripts \
		&& chown -R springxd:springxd /opt/spring-xd-${XD_VERSION}

# Add mysql connector
RUN wget "http://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-java-5.1.36.zip" \
		-O /tmp/mysql-connector-java-5.1.36.zip \
		&& unzip /tmp/mysql-connector-java-5.1.36.zip -d /tmp \
		&& mv /tmp/mysql-connector-java-5.1.36/mysql-connector-java-5.1.36-bin.jar /opt/spring-xd/xd/lib \
		&& rm -rf /tmp/* /var/tmp/*

# add aws config
ADD aws-config /home/springxd/.aws/config

# Install awscli
RUN pip install awscli && \
		chown -R springxd:springxd /home/springxd/.aws && \
		adduser springxd sudo && \
		echo "springxd ALL=(ALL) NOPASSWD: /usr/sbin/cron" >> /etc/sudoers

# 1. Make sure that often-used libs are in global XD lib: https://jira.spring.io/browse/XD-1440
# 2. Cleanup
RUN mv /opt/spring-xd/xd/modules/sink/kafka/lib/* /opt/spring-xd/xd/lib/ && \
		mv /opt/spring-xd/xd/modules/source/kafka/lib/* /opt/spring-xd/xd/lib/ && \
		apt-get purge -y build-essential && \
		apt-get -y autoremove && \
		apt-get clean && \
		rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Add start scripts
ADD common-config.sh /common-config.sh
ADD start-admin.sh /start-admin.sh
ADD start-container.sh /start-container.sh

# set locales
RUN apt-get update && \
	apt-get -y install locales && \
	locale-gen en_US.UTF-8 && \
		apt-get clean && \
		rm -rf /var/lib/apt/lists/*
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

USER springxd

# add cronjobs for synching the modules and scripts
RUN crontab -l | { cat; echo "*/1 * * * * /usr/local/bin/aws s3 sync s3://riox-modules /opt/spring-xd/xd/modules"; } | crontab - && \
		crontab -l | { cat; echo "*/1 * * * * /usr/local/bin/aws s3 sync s3://riox-scripts /opt/spring-xd/riox-scripts"; } | crontab -

WORKDIR /opt/spring-xd
EXPOSE 9393 9000 9001 9002
