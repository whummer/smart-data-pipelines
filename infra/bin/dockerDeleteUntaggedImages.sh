#!/bin/bash

if [ "$1" == "-y" ]; then
        docker rmi -f $(docker images | grep "<none>" | awk "{print \$3}")
else
        echo "Images to delete (use -y to actually delete!):"
        docker images | grep "<none>" | awk "{print \$3}"
fi
