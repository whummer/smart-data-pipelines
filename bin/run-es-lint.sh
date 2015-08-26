#!/bin/bash
: ${IMAGE_VERSION?"Need to set IMAGE_VERSION"}

docker run -v `pwd`:/test-results riox/hyperriox:$IMAGE_VERSION /bin/sh -c 'eslint -f checkstyle services/ > /test-results/eslint-results.xml && chown 106:111 /test-results/eslint-results.xml'
