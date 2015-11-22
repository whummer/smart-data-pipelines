#!/bin/bash

# Note: 
#   * Grep for output to delete only images that are at least 3+ days old.
#   * Only delete images where the second column (TAG) is a 40 digit commit hash.

if [ "$1" == "-y" ]; then
	docker images \
		| grep "riox/hyperriox" \
		| grep '^[^\s]*[\s]*[0-9a-z]\{40\}' \
		| grep '\([3-9]\|[0-9]\{2\}\) days ago\|weeks ago' \
		| awk '{print $3}' \
		| xargs docker rmi

else
	echo "Images to delete (use -y to actually delete!):"
	docker images \
		| grep "riox/hyperriox" \
		| grep '^[^\s]*[\s]*[0-9a-z]\{40\}'\
		| grep '\([3-9]\|[0-9]\{2\}\) days ago\|weeks ago'

fi
