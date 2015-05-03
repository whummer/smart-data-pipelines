#!/bin/bash

# for some reason the .dockerignore does not work
rm -rf `find . -name node_modules`
npm install
node bin/preinstall.js
gulp ui:bower