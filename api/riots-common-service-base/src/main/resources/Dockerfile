FROM dockerfile/java:oracle-java8

MAINTAINER "Oliver Moser <o@omoser.com>"

# add the JAR to lib dir
ADD ${project.build.finalName}.jar /var/lib/riots/

# set execution environment
ENV RIOT_PORT ${riots.port}
ENV RIOTS_LOG_DIR /var/tmp

# expose port from build config (can be overriden with docker run .. -e "RIOT.PORT=1234")
EXPOSE ${riots.port}

# run the microservice
CMD java -Dserver.port=$RIOT_PORT -jar /var/lib/riots/${project.build.finalName}.jar
