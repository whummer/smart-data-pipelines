#!/bin/bash

: ${IMAGE_VERSION?"Need to set IMAGE_VERSION"}

TEST_REPORTER=${TEST_REPORTER:-spec}

if [[ "$TEST_REPORTER" == "mocha-jenkins-reporter" ]]; then
	# This branch is for jenkins
	docker run -e TEST_REPORTER=$TEST_REPORTER -v `pwd`:/test-results riox/hyperriox:$IMAGE_VERSION /bin/sh -c 'gulp services:test:unit && cp --parents `find . -name test-report.xml` /test-results && chown 106:111 `find /test-results -name test-report.xml`'
else
	# This branch is for local testing
	docker run -it riox/hyperriox:$IMAGE_VERSION gulp services:test:unit
fi
