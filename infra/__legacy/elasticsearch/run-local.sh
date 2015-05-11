#!/bin/sh

# pull image
docker pull dockerfile/elasticsearch

# run image
docker run -d -p 9200:9200 -p 9300:9300 dockerfile/elasticsearch
