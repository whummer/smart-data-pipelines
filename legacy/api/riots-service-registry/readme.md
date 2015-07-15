# IMPORTANT NOTE
if you are running a docker based Eureka instance inside vbox and want to switch to the spring-boot based version in here,
please remove the NAT rule for eureka from the vbox:

```
VBoxManage controlvm boxen-boot2docker-vm natpf1 delete eureka
```

