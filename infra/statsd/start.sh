#!/bin/bash

docker run -d \
  --name statsd_graphite \
  -p 8123:80 \
  -p 2003:2003 \
  -p 8125:8125/udp \
  hopsoft/graphite-statsd
