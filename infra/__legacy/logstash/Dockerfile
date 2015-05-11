FROM dockerfile/java:oracle-java8

# fetch logstash tarball
RUN mkdir /opt/logstash
RUN wget -qO-  https://download.elasticsearch.org/logstash/logstash/logstash-1.4.2.tar.gz | tar -C /opt/logstash -xzf -

ADD config/logstash.json /opt/logstash/bin/logstash.json
CMD /opt/logstash/bin/logstash -f /opt/logstash/bin/logstash.json
