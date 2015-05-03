FROM riox/nodejs:0.12.2
MAINTAINER riox

ADD . /code
WORKDIR /code

RUN ./bin/bootstrap-node-reqs.sh

CMD ["/bin/bash"]