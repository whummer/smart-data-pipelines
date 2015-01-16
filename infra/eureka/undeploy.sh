#!/bin/bash

source $(dirname $0)/../helpers.sh

resize_controller eureka 0
delete_controller eureka

#delete_service eureka