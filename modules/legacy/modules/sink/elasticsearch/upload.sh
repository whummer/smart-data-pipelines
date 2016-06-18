#!/bin/bash

aws s3 cp build/libs/elasticsearch-sink-1.0.0.BUILD-SNAPSHOT.jar s3://riox-modules/sink/elasticsearch.jar
