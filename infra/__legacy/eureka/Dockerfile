FROM riox/viotualize-tomcat8
MAINTAINER riox "https://github.com/riox"

ENV DEBIAN_FRONTEND noninteractive
ENV CATALINA_HOME /opt/apache-tomcat-8.0.9
ADD wars/hystrix-dashboard-1.3.16.war $CATALINA_HOME/webapps/hystrix-dashboard.war
ADD wars/eureka-server-1.1.138.war $CATALINA_HOME/webapps/eureka.war
ADD config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80
#CMD ["/usr/bin/supervisord"]
CMD ["/opt/tomcat/bin/catalina.sh", "run", "2>&1"]