#!/bin/bash

echo "WARNING: NEVER execute this script on your local machine!"

# for some reason the .dockerignore does not work, so brute force
echo "Removing node_modules dirs"
rm -rf `find . -name node_modules`

# install binaries: gulp, mocha
echo "Installing gulp binary"
npm install -g gulp mocha
gulp -v || exit 1

# TODO REMOVE!
# install local modules first (global flag on: -g)
#echo "installing riox-shared"
#npm install -g ./riox-shared

# install all deps required to make a gulp run
echo "install gulp dependencies"
npm install --ignore-scripts

# install bower dep
echo "installing bower dependencies"
gulp ui:bower || exit 1

# TODO REMOVE!
#echo "installing riox-services-base"
#(cd ./services && npm install -g ./riox-services-base)

# now install all other modules (global flag on: -g)
echo "installing global npm dependencies"
gulp deps:install:global

# install some utils
echo "install some tools/util programs inside test container"
apt-get update -y
apt-get install -y vim nano less || echo

# clean up
echo "cleaning up."
rm -r ./*

echo "All done."