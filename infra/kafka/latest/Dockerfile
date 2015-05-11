FROM java:8
MAINTAINER riox 

ENV KAFKA_VERSION="0.8.2.1" SCALA_VERSION="2.10"

RUN apt-get update && apt-get install -y unzip wget curl net-tools 

ADD download-kafka.sh /tmp/download-kafka.sh
RUN /tmp/download-kafka.sh
RUN tar xf /tmp/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz -C /opt 

VOLUME ["/data"]

ENV KAFKA_HOME /opt/kafka_${SCALA_VERSION}-${KAFKA_VERSION}
ADD start-kafka.sh /usr/bin/start-kafka.sh
CMD start-kafka.sh
