#!/bin/bash

source $(dirname $0)/../helpers.sh

resize_controller $1 0
delete_controller $1
#delete_service $1