#!/bin/bash

LIBFILE=build/libs/processor-enricher-1.0.0.BUILD-SNAPSHOT.jar
MODULE=processor/enricher.jar

if [ ! -e $LIBFILE ]; then
	./gradlew clean test bootRepackage
fi

aws s3 cp $LIBFILE s3://riox-modules/$MODULE
