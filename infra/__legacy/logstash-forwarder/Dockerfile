FROM ubuntu/latest

# env vars
ENV HOME /root
ENV GOPATH /root/go
ENV PATH /root/go/bin:/usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:

# GOPATH
RUN mkdir -p /root/go

RUN apt-get update
RUN apt-get install -y build-essential mercurial git subversion wget curl

# go 1.3 tarball
RUN wget -qO- http://golang.org/dl/go1.3.1.linux-amd64.tar.gz | tar -C /usr/local -xzf -

RUN git clone git://github.com/elasticsearch/logstash-forwarder.git
RUN cd logstash-forwarder
RUN go build

