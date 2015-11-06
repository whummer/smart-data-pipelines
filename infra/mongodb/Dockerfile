FROM mongo:3.0.2

MAINTAINER Waldemar Hummer

# adjust permissions, required to run as non-privileged user
RUN mkdir -p /data/db && chmod 777 -R /data/ && ls -la /data/

# TODO: currently we cannot run mongod as user 'nobody', because
# the /data/db volume directory is mounted with mode 755 by default,
# and then mongo attempts to "chown -R mongodb /data/db", which 
# leads to an error when starting the container as user 'nobody'.
#USER nobody

#ENTRYPOINT []

#CMD mongod
