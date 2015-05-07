#!/bin/bash

source $(dirname $0)/../helpers.sh

resize_controller docker-registry 0
delete_controller docker-registry

#delete_service docker-registry