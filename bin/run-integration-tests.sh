#!/bin/bash

: ${IMAGE_VERSION?"Need to set IMAGE_VERSION"}
: ${TEST_REPORTER?"Need to set TEST_REPORTER"}

BASEDIR=`dirname $0`
TEST_REPORTER=${TEST_REPORTER:-spec}

if [[ "$TEST_REPORTER" == "mocha-jenkins-reporter" ]]; then

	# delete in casae there is a leftover
	(cd $BASEDIR/../ && make cleanup-integration-tests)

	# This branch is for jenkins
	(cd $BASEDIR/../ && make run-integration-tests)

	# wait for the tests to finish
	for i in `seq 1 60`;
	do
		sleep 10
		success=`kubectl get pods --namespace=$RIOX_ENV -o template integration-tests --template={{.status.phase}}`
		echo "Waiting for test to finish..."
		echo "Pod status: $success"
		if [[ "$success" == "Succeeded" ]]; then
			break
		elif [[ "$success" == "Failed" ]]; then
			echo "Tests failed (logs below): "
			kubectl --namespace=$RIOX_ENV logs integration-tests
			exit 1
		fi
	done

	# get the test result from the output
	kubectl --namespace=$RIOX_ENV logs integration-tests | sed -n '/<testsuites/,/<\/testsuites/p' > $BASEDIR/../services/test/integration-test-report.xml

	# delete container
	(cd $BASEDIR/../ && make cleanup-integration-tests)
fi
