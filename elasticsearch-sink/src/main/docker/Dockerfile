FROM riox/jdk
MAINTAINER Riox Image Admin <dev@riox.io>

# Alpine Linux doesn't use pam, which means that there is no /etc/nsswitch.conf,
# but Java relies on /etc/nsswitch.conf to check the order of DNS resolving
# (i.e. check /etc/hosts first and then lookup DNS-servers).
# To fix this we just create /etc/nsswitch.conf and add the following line:
#RUN echo 'hosts: files mdns4_minimal [NOTFOUND=return] dns mdns4' >> /etc/nsswitch.conf

ADD *-exec.jar /module.jar

ENTRYPOINT ["/init", "java", "-jar", "/module.jar"]