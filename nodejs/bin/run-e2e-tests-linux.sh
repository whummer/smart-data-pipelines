#!/bin/bash

img=riox/testbox

docker run -it -v `pwd`:/code -v /var/run/docker.sock:/var/run/docker.sock $img bash -c "cd services && mocha"
