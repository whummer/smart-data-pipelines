#!/bin/bash

#
# This script will mount /Users in the boot2docker VM using NFS (instead of the
# default vboxsf). It's probably not a good idea to run it while there are
# Docker containers running in boot2docker.
#
# Usage: sudo ./boot2docker-use-nfs.sh
#

if [ "$USER" != "root" ]
then
  echo "This script must be run with sudo: sudo ${0}"
  exit -1
fi

IFACE=en0
if [ "$1" == "" ] 
then
  echo "No interface specified. Using \"en0\" as the default interface to allow NFS access."
else 
  echo "Using \"$1\" as the network interface to allow NFS access."
  IFACE=$1
fi

OSX_IP=$(ifconfig $IFACE | grep --word-regexp inet | awk '{print $2}')
if [ "$OSX_IP" == "" ]
then
  echo "No IP found. Network interface $IFACE not valid."
  exit 1;
fi

# Run command as non root http://stackoverflow.com/a/10220200/96855
B2D_IP=$(sudo -u ${SUDO_USER} boot2docker ip &> /dev/null)

if [ "$?" != "0" ]
then
  sudo -u ${SUDO_USER} boot2docker up
  $(sudo -u ${SUDO_USER} boot2docker shellinit)
  B2D_IP=$(sudo -u ${SUDO_USER} boot2docker ip &> /dev/null)
  #echo "You need to start boot2docker first: boot2docker up && \$(boot2docker shellinit) "
  #exit -1
fi

MAP_USER=${SUDO_USER}
MAP_GROUP=$(sudo -u ${SUDO_USER} id -n -g)

# Backup exports file
$(cp -n /etc/exports /etc/exports.bak) && \
  echo "Backed up /etc/exports to /etc/exports.bak"

# Delete previously generated line if it exists
grep -v '^/Users ' /etc/exports > /etc/exports

# We are using the OS X IP because the b2d VM is behind NAT
echo "/Users -mapall=${MAP_USER}:${MAP_GROUP} ${OSX_IP}" \
  >> /etc/exports

# https://gist.github.com/sirkkalap/40261ed82386ad8a6409
# This option controls whether MOUNT requests are required to originate from a reserved port
# (port < 1024).  The default value is 1 (yes).  Many NFS server implementations require this
# because of the false belief that this requirement increases security.
echo "nfs.server.mount.require_resv_port = 0" >> /etc/nfs.conf

nfsd restart

sudo -u ${SUDO_USER} boot2docker ssh << EOF
  echo "Unmounting /Users"
  sudo umount /Users 2> /dev/null
  echo "Restarting nfs-client"
  sudo /usr/local/etc/init.d/nfs-client restart 2> /dev/null
  echo "Waiting 10s for nfsd and nfs-client to restart."
  sleep 10
  echo "Mounting /Users"
  sudo mount $OSX_IP:/Users /Users -o rw,sync,noatime,rsize=32768,wsize=32768,proto=tcp,nfsvers=3
  echo "Mounted /Users:"
  ls -al /Users
  exit
EOF
