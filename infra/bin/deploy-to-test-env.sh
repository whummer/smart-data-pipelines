#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`
bold=`tput bold`

BASEDIR=`dirname $0`
export RIOX_ENV=test

# Checks success fo a command and exist if != 0
function checkSuccess {
  if [[ "$?" == "0" ]]; then
    printf "${green}PASS${reset}\n"
  else
    printf "${red}FAILED${reset}\n"
    cleanup
    exit 1
  fi
}

function printLabel {
  echo "${bold}##################################${reset}"
  echo "${bold}$1${reset}"
  echo "${bold}##################################${reset}"
}

function cleanup {
  printLabel "Cleaning up"
  (cd $BASEDIR/../ && make undeploy-services)
  (cd $BASEDIR/../../nodejs && make undeploy-services)
}


# DEPLOY INFRASTRUCTURE SERVICES
printLabel "Infrastructure service deployment "
(cd $BASEDIR/../ && make deploy-services)
checkSuccess

# TODO this is bad we should use the liveliness checks
sleep 10

# DEPLOY RIOX SERVICES
printLabel "Riox micro service deployment "
(cd $BASEDIR/../../nodejs && make deploy-services)
checkSuccess

printLabel "Waiting for the Riox services to settle "

lb_endpoint=`kubectl --namespace=test describe service gateway | grep "LoadBalancer Ingress" | awk -F':' '{ print $2 }' | xargs`
echo "Found AWS ELB endpoint: ${lb_endpoint}"
output=
while [[ !("$output" =~ "riox.all.min.js") ]]; do
  output=`curl -s -H "Host: platform.riox.io" http://${lb_endpoint}`

  # TODO remove this after the timing issue with the metadata has been fixed
  if [[ "$output" =~ "No resource found" ]]; then
      echo "Restarting user and streams service..."
      kubectl --namespace=${RIOX_ENV} scale rc streams-service --replicas=0
      kubectl --namespace=${RIOX_ENV} scale rc streams-service --replicas=2
      kubectl --namespace=${RIOX_ENV} scale rc users-service --replicas=0
      kubectl --namespace=${RIOX_ENV} scale rc users-service --replicas=2
      sleep 10
  fi

  printf "."
	sleep 5
done
printf "\n"

echo "Cluster seems operational!"

printLabel "Running selenium test on latest deployment: ${lb_endpoint}"

if [ -e "/usr/bin/xvfb-run" ]; then
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && xvfb-run mvn -Driox.endpoint="${lb_endpoint}" test)
else
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && mvn -Driox.endpoint="${lb_endpoint}" test)
fi
checkSuccess

printLabel "Cleanup infrastructure"
cleanup
