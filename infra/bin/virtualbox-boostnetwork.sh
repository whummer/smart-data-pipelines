#!/usr/bin/env bash

VBoxManage modifyvm boot2docker-vm --natdnshostresolver1=on
VBoxManage modifyvm boot2docker-vm --natdnsproxy1=on
VBoxManage modifyvm boot2docker-vm --nictype1=virtio
