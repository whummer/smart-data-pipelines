#!/bin/bash

LIBFILE=build/libs/processor-timeseries-1.0.0.BUILD-SNAPSHOT.jar
MODULE=processor/timeseries.jar

if [ ! -e $LIBFILE ]; then
	./gradlew clean test bootRepackage
fi

aws s3 cp $LIBFILE s3://riox-modules/$MODULE
