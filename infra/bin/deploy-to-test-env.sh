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

trap "cleanup" INT TERM
#trap "cleanup" EXIT

# Checks success of a command and exist if != 0 and cleans up.
function checkSuccess () {
  if [[ "$?" == "0" ]]; then
    printf "${green}PASS${reset}\n"
  else
    printf "${red}FAILED${reset}\n"
    cleanup
    exit 1
  fi
}

function printLabel () {
  echo "${bold}##################################${reset}"
  echo "${bold}$1${reset}"
  echo "${bold}##################################${reset}"
}

# Cleans up all resources on the cloud
function cleanup () {
  printLabel "Cleaning up"
  (cd $BASEDIR/../ && make undeploy-services)
  (cd $BASEDIR/../../ && make undeploy-services)
  #kill -KILL $$
}

# Usage: run_with_timeout N cmd args...
#    or: run_with_timeout cmd args...
# In the second case, cmd cannot be a number and the timeout will be 10 seconds.
function run_with_timeout () {
  local time=10
  if [[ $1 =~ ^[0-9]+$ ]]; then time=$1; shift; fi
  # Run in a subshell to avoid job control messages
  ( "$@" &
    child=$!
    # Avoid default notification in non-interactive shell for SIGTERM
    trap -- "" SIGTERM
    ( sleep $time
      kill $child 2> /dev/null ) &
    wait $child
  )
}

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
  cleanup
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
  cleanup
  exit 1
fi

printLabel "Running selenium test on latest deployment: ${lb_endpoint}"
if [ -e "/usr/bin/xvfb-run" ]; then
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && xvfb-run mvn -Driox.endpoint="${lb_endpoint}" test)
else
  (cd $BASEDIR/../../e2e/selenium/e2e.ui && mvn -Driox.endpoint="${lb_endpoint}" test)
fi
checkSuccess
cleanup
