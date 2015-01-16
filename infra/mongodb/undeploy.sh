#!/bin/bash

source $(dirname $0)/../helpers.sh

resize_controller mongodb 0
delete_controller mongodb
#delete_service mongodb