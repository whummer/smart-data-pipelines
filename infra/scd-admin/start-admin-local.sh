#!/bin/sh

. /common-config.sh

crond && java -jar admin.jar
