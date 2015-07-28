## FAQ

#### DNS resolution does not seem to work.

For some reason the `kube2sky` control loop is hanging. The only way that I found is to restart the container. A brute force way is the following:

```sh
docker ps | grep kube2sky | awk -F' ' '{ print $1 }' | xargs docker restart
```

#### How do I use NFS with boot2docker?

Our tests use file mounts in docker (`-v` flag), which is awefully slow per with `vboxfs`. There is a simple script that
runs NFS in `../infra/bin/boot2docker-use-nfs.sh` that sets up NFS on your Mac and boot2docker and mounts `/Users`.

*Note*: You have to re-run this script, when you change network locations. Also, since the lookup of the IP to use
is based on the network adapter, as follows, `OSX_IP=$(ifconfig en1 | grep --word-regexp inet | awk '{print $2}')`, you
may have to manually tweak this if you are not using `en1` (aka WIFI).
