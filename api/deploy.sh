#!/bin/bash

BASEDIR=`dirname $0`

chmod 600 $BASEDIR/../infra/ssh-keys/google_compute_engine

ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i $BASEDIR/../infra/ssh-keys/google_compute_engine ubuntu@146.148.126.222 <<'ENDSSH'
FIG_FILE=/root/riots/infra/fig.yml
(cd /root/riots/ && git pull)
sudo -u root fig -f $FIG_FILE pull --allow-insecure-ssl 
sudo -u root fig -f $FIG_FILE up -d
ENDSSH
