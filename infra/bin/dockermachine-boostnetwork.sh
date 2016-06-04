#!/usr/bin/env bash

VM_NAME=default

VBoxManage modifyvm $VM_NAME --natdnshostresolver1=on
VBoxManage modifyvm $VM_NAME --natdnsproxy1=on
VBoxManage modifyvm $VM_NAME --nictype1=virtio
