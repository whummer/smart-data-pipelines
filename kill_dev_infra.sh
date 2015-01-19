#!/bin/bash

RIOTS_SERVICE_PACKAGE='io.riots|catalina'
RIOTS_PIDS=`ps -eaf | egrep "$RIOTS_SERVICE_PACKAGE" | grep -v "grep" | awk '{print $2}'`;

if [ -z "$RIOTS_PIDS" ]; then
	echo "Seems like riots isn't running at all."
	exit;
fi;

for pid in $RIOTS_PIDS; do
	SERVICE_NAME=`ps -eaf | grep $pid |  grep -o "io.riots.*" | egrep -o "[[:upper:]].+"`;
	if [ -z "$SERVICE_NAME" ]; then
		SERVICE_NAME="riots-ui";
	fi;

	echo "Killing riots service >> $SERVICE_NAME << (PID $pid)..."; 
	$(kill $pid);
	sleep 4;
	CHECK=$(ps -eaf | grep "$SERVICE_NAME" | grep -v "grep");
	#echo "check: $CHECK";
	if [ -n "$CHECK" ]; then
		echo "$SERVICE_NAME seems to be die-hard, trying to kill it with a vengance...";
		$(kill -9 $pid);
	fi;


done
