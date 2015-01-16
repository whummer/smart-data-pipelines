#!/bin/bash

source $(dirname $0)/../helpers.sh

resize_controller elasticsearch 0
delete_controller elasticsearch

#delete_service elasticsearch