#!/bin/bash

source $(dirname $0)/../helpers.sh

resize_controller activemq 0
delete_controller activemq

#delete_service activemq