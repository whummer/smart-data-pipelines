#!/bin/bash

# for some reason the .dockerignore does not work, so brute force
rm -rf `find . -name node_modules`
npm install --unsafe-perm
gulp ui:bower