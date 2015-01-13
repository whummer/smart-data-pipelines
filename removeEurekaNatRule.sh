#!/bin/sh

echo "Removing NAT rule for eureka (:10000)..."
VBoxManage controlvm boxen-boot2docker-vm natpf1 delete eureka
echo "Done. Go ahead and start your non-vbox eureka instance"
