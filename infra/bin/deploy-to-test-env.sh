#!/bin/bash

red=`tput setaf 1`
green=`tput setaf 2`
reset=`tput sgr0`
bold=`tput bold`

BASEDIR=`dirname $0`
export RIOX_ENV=test

# Error handling
#trap "cleanup" SIGHUP
#trap "cleanup" SIGINT
#trap "cleanup" SIGTERM
#trap "cleanup" INT

#trap "cleanup" INT TERM
#trap "cleanup" EXIT

# Checks success of a command and exist if != 0 and cleans up.
function checkSuccess () {
  if [[ "$?" == "0" ]]; then
    printf "${green}PASS${reset}\n"
  else
    printf "${red}FAILED${reset}\n"
    exit 1
  fi
}

function printLabel () {
  echo "${bold}##################################${reset}"
  echo "${bold}$1${reset}"
  echo "${bold}##################################${reset}"
}

printLabel "Cleanup up from previous run"
./$BASEDIR/cleanup-test-env.sh

# DEPLOY INFRASTRUCTURE SERVICES
printLabel "Infrastructure service deployment "
(cd $BASEDIR/../ && make deploy-services)
checkSuccess

# TODO this is bad we should use the liveliness checks
sleep 10

# DEPLOY RIOX SERVICES
printLabel "Riox micro service deployment "
(cd $BASEDIR/../../ && make deploy-services)
checkSuccess

printLabel "Waiting for the Riox services to settle "

# run in loop with 3 seconds sleep
lb_endpoint=
for i in `seq 1 10`;
do
  sleep 3
  lb_endpoint=`kubectl --namespace=${RIOX_ENV} describe service gateway | grep "LoadBalancer Ingress" | awk -F':' '{ print $2 }' | xargs`
  #echo "AWS ELB endpoint: ${lb_endpoint}"
  if [[ "$lb_endpoint" != "" ]]; then
    break
  fi
done

echo "AWS ELB endpoint: ${lb_endpoint}"
if [[ "$lb_endpoint" == "" ]]; then
  echo "Error: we most likely hit the race condiation as described here:"
  echo "       --> https://github.com/GoogleCloudPlatform/kubernetes/issues/11324"
  exit 1
fi

printf "Waiting for Riox services to be ready "
output=
for i in `seq 1 50`;
do
  output=`curl -s -H "Host: demo.riox.io" http://${lb_endpoint}`
  if [[ "$output" =~ "riox.all.min.js" ]]; then
    break
  else
    printf "."
    sleep 10
  fi
done
printf "\n"

output=`curl -s -H "Host: demo.riox.io" http://${lb_endpoint}`
if [[ "$output" =~ "riox.all.min.js" ]]; then
  echo "Cluster seems operational!"
else
  echo "Cluster does not seem to work!"
  echo "Output: $output"
  exit 1
fi

printLabel "Running selenium test on latest deployment: ${lb_endpoint}"
if [ -e "/usr/bin/xvfb-run" ]; then
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && xvfb-run mvn -Driox.endpoint="${lb_endpoint}" test)
else
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && mvn -Driox.endpoint="${lb_endpoint}" test)
fi
checkSuccess

# Only cleanup at success
if [[ $? -eq 0 ]]; then
  ./$BASEDIR/cleanup-test-env.sh
fi
