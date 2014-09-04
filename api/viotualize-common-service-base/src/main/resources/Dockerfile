FROM ubuntu:latest

MAINTAINER "Oliver Moser <o@omoser.com>"

# Update the APT cache
RUN sed -i.bak 's/main$/main universe/' /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

# Install and setup project dependencies
RUN apt-get install -y curl wget
RUN locale-gen en_US en_US.UTF-8

# prepare for Java download
RUN apt-get install -y python-software-properties
RUN apt-get install -y software-properties-common

# grab oracle java (auto accept licence)
RUN add-apt-repository -y ppa:webupd8team/java
RUN apt-get update
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | /usr/bin/debconf-set-selections
RUN apt-get install -y oracle-java8-installer

# add the JAR to lib dir
ADD ${project.build.finalName}.jar /var/lib/riots/

# set execution environment
ENV RIOT_PORT ${riots.port}
ENV VIOTUALIZE_LOG_DIR /var/tmp

# expose port from build config (can be overriden with docker run .. -e "RIOT.PORT=1234")
EXPOSE ${riots.port}

# run the microservice
CMD java -Dserver.port=$RIOT_PORT -jar /var/lib/riots/environment-service-0.0.1-SNAPSHOT.jar
