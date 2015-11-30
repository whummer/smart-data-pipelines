FROM redis:2.8
RUN apt-get update
RUN apt-get install -yy -q python

COPY files/redis-master.conf /redis-master/redis.conf
COPY files/redis-slave.conf /redis-slave/redis.conf
COPY files/run.sh /redis/run.sh
COPY files/sentinel.py /redis/sentinel.py
COPY files/sentinel.conf /redis/sentinel.conf

RUN mkdir data/ && \
		chmod -R 777 /redis /data /redis-slave /redis-master

USER nobody
WORKDIR /redis
CMD [ "/redis/run.sh" ]
ENTRYPOINT [ "sh", "-c" ]
