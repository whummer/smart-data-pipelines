#!/bin/bash

ADMIN_USER=guest
ADMIN_PASSWORD=guest
HOST=http://localhost:15672
VHOST=riox

# create the vhost
curl -i -u ${ADMIN_USER}:${ADMIN_PASSWORD} -H 'content-type:application/json' -XPUT ${HOST}/api/vhosts/${VHOST}

# add permission to the vhost
curl -i -u ${ADMIN_USER}:${ADMIN_PASSWORD} -H 'content-type:application/json' \
                -XPUT ${HOST}/api/permissions/${VHOST}/${ADMIN_USER} \
                --data '{"user":"${ADMIN_USER}","vhost":"/${VHOST}","configure":".*","write":".*","read":".*"}'


