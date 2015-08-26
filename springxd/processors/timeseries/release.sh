#!/bin/bash

rm -r ./release/
mkdir -p release/xd
./gradlew clean xdModule
./gradlew xdModuleDeploy -PxdHome=release/xd/
./gradlew wekaDeploy -PxdHome=release/xd/

rm -f release/processor-timeseries.tgz
(cd release && tgz processor-timeseries.tgz xd/)
