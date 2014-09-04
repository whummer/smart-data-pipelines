#!/bin/sh

# build ES docker container
docker build -t riots/elasticsearch .

# run ES docker container
docker run -d -p 9200:9200 -p 9300:9300 -v <data-dir>:/data riots/elasticsearch /elasticsearch/bin/elasticsearch -Des.config=/data/elasticsearch.yml
