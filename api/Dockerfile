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

#ENV RIOTS_HOME /var/lib/riots
#ADD viotualize-service-environment/target/environment-service-0.0.1-SNAPSHOT.jar $RIOTS_HOME/
ADD viotualize-service-environment/target/environment-service-0.0.1-SNAPSHOT.jar /var/lib/riots/

ENV server.port 8181
ENV eureka.port 8181

EXPOSE 8181
#WORKDIR $RIOTS_HOME
CMD ["java", "-jar", "/var/lib/riots/environment-service-0.0.1-SNAPSHOT.jar"]

# link and run the container
# docker run -i -t -p 8181:8181 --link eureka:eureka --name environment-service omoser/riots-base
