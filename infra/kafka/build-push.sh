#!/bin/bash
docker build -t riox/kafka:latest .
docker push riox/kafka:latest
