#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`

: ${RIOX_ENV:=development}


# TODO: Check rereqs:
#  - brew install coreutils (for timeout)


printf "Verifying Kubernetes Master: "

#
# Verify master
#
output=`curl -s localhost:8080/healthz`
if [ "$output" == "ok" ]; then
	printf "${green}PASS${reset}\n"
else
  printf "${red}FAIL${reset}\n"

  echo "  Potential fixes:"
  echo "    - [OS X] Ensure route exists: sudo route -n add 10.0.0.0/16 192.168.59.103"
  echo "    - [OS X] Ensure port forward is open: boot2docker ssh -L8080:localhost:8080"
fi
echo ""

#
# Verify connectivity to DNS
#
printf "Verifying DNS Connectivity: "

output=`dig @10.0.0.100 +short kubernetes.default.svc.cluster.local`
if [ "$output" == "10.0.0.1" ]; then
	printf "${green}PASS${reset}\n"
else
  printf "${red}FAIL${reset}\n"

  echo "  Potential fixes:"
  echo "    - [ALL]  Restart kube2sky because it often hangs : docker ps | grep kube2sky | awk -F' ' '{ print \$$1 }' | xargs docker
  echo "    - [OS X] Ensure route exists: sudo route -n add 10.0.0.0/16 192.168.59.103"
  restart"
fi
echo ""

#
# Verify DNS resolution works
#
declare -a hosts=('mongo' 'redis' 'kafka' 'zookeeper');
echo "Verifying DNS Resolution: "
for h in "${hosts[@]}"
do
	output=`dig @10.0.0.100 +short ${h}.${RIOX_ENV}.svc.cluster.local`

	printf "   %-30s " "$h.${RIOX_ENV}.svc.cluster.local:"

	if [ "$output" == "" ]; then
		printf "${red}FAIL${reset}\n"
	else
		printf "${green}PASS${reset}\n"
	fi
done

echo ""


# Verify services are UP

printf "Verify Zookeeper is working:  "
output=`echo ruok | nc zookeeper.${RIOX_ENV}.svc.cluster.local 2181`
if [ "$output" == "imok" ]; then
	printf "%-5s ${green}PASS${reset}\n"
else
	printf "%-5s ${red}FAIL${reset}\n"
fi
