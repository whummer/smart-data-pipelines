#!/bin/bash

BASEDIR=`dirname $0`

ssh -i $BASEDIR/../infra/ssh-keys/google_compute_engine ubuntu@146.148.126.222 <<'ENDSSH'
FIG_FILE=/root/riots/infra/fig.yml
sudo -u root fig -f $FIG_FILE pull --allow-insecure-ssl 
sudo -u root fig -f $FIG_FILE up -d
ENDSSH