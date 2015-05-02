#!/bin/bash


(cd ./spring-xd-base/1.1.1/ && ./build-push.sh)
(cd ./spring-xd-admin/1.1.1 && ./build-push.sh)
(cd ./spring-xd-container/1.1.1 && ./build-push.sh)
(cd ./spring-xd-hsqldb/1.1.1 && ./build-push.sh)
(cd ./spring-xd-shell/1.1.1 && ./build-push.sh)
(cd ./spring-xd-zookeeper/1.1.1 && ./build-push.sh)
