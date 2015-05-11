#!/bin/bash

source $(dirname $0)/../helpers.sh


for ctrl in "${CONTROLLERS[@]}"
do
	resize_controller "$ctrl-${IMAGE_TAG}" 0
done

sleep 10

for ctrl in "${CONTROLLERS[@]}"
do
	delete_controller "$ctrl-${IMAGE_TAG}"
done



