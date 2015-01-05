#!/bin/bash

RIOTS_SERVICE_PACKAGE='io.riots'
RIOTS_PIDS=`ps -eaf | grep "$RIOTS_SERVICE_PACKAGE" | grep -v "grep" | awk '{print $2}'`;

if [ -z "$RIOTS_PIDS" ]; then
	echo "Seems like riots isn't running at all."
	exit;
fi;

for pid in $RIOTS_PIDS; do
	SERVICE_NAME=`ps -eaf | grep $pid |  grep -o "io.riots.*" | egrep -o "[[:upper:]].+"`;
	echo "Killing riots service >> $SERVICE_NAME << (PID $pid)..."; 
	$(kill $pid);
	CHECK=$(ps -eaf | grep $SERVICE_NAME);
	sleep 2;
	if [ -n "$CHECK" ]; then
		echo "$SERVICE_NAME seems to be die-hard, trying to kill it with a vengance...";
		$(kill -9 $pid);
	fi;


done
