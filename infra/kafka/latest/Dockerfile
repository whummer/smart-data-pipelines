FROM delitescere/jdk
MAINTAINER riox

ENV KAFKA_VERSION="0.8.2.2" SCALA_VERSION="2.10"
ENV KAFKA_HOME /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION}

RUN apk update && apk add unzip wget curl net-tools bash

ADD download-kafka.sh /tmp/download-kafka.sh
ADD start-kafka.sh /start-kafka.sh

RUN /tmp/download-kafka.sh && \
		mkdir /opt /data && \
		tar xzf /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -C /opt && \
		chown -R nobody:nogroup ${KAFKA_HOME} /data && \
		chmod 777 ${KAFKA_HOME}/bin/* && \
		chmod 777 /start-kafka.sh && \
		rm -rf /tmp/*

VOLUME ["/data"]
USER nobody
CMD [ "/start-kafka.sh" ]
