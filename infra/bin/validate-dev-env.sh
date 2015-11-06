#!/bin/bash
source ./common.sh

: ${RIOX_ENV:=development}

# define hosts to check DNS for
declare -a hosts=('mongo' 'redis');

# define required luarocks (for openresty)
declare -a lua_libs=('luasocket' 'ansicolors' 'luasec' 'lua-cjson' 'busted' 'lapis' 'moonscript' 'inspect' 'luajwt');

# cluster DNS IP
declare dns_server=10.0.0.100

# cli arguments
check_host_dns=1
check_k8s_dns=1
check_lua_env=1
check_openresty=1
check_redx=1
silent=1

read -r -d '' HELP_TEXT <<'USAGE_TEXT'
Usage: kube-up.sh [-fndursh]
Available options are:
	-f  disable forward to port 8080 on docker machine (required for kubectl)
	-n  disable adding route to enable local name resolution via skyDNS
	-d  disable skyDNS
	-u  disable kube-ui
	-r  start local docker registry
	-s  silent mode
	-h  show this help text
USAGE_TEXT

function show_help {
	echo "$HELP_TEXT"
    exit 0
}

while getopts "dhlors?:" opt; do
    case "$opt" in
    \?)
        show_help
        exit 0
        ;;
    d)  check_k8s_dns=0
        ;;
    h)  check_host_dns=0
        ;;
	l)  check_lua_env=0
		;;
	o)  check_openresty=0
		;;
	r)  check_redx=1
		;;
	s)  silent=1
		;;
    esac
done


#
# verify docker
#
printf "Verifying Docker: "
docker_info=$(docker info 2>/dev/null | grep "Containers")
if [ -n "$docker_info" ]; then
	printf "${green}   ${checkmark} PASS${reset}\n"
else
  printf "${red}   ${error} FAIL${reset}\n"
  echo "  Potential fixes:"
  echo "    - [OS X] run 'docker-machine restart docker-vm' or 'boot2docker restart'"
fi
echo ""

#
# verify routes and port forwards on Mac OS only
#
if [ "$(uname)" == "Darwin" ]; then
	printf "Verifying etcd SSH tunnel for docker-machine: "
	etcd_tunnel_up=$(ps -eaf | grep ssh | grep "4001:localhost:4001")
	if [ -n "$etcd_tunnel_up" ]; then
		printf "${green}   ${checkmark} PASS${reset}\n"
	else
	  printf "${red}   ${error} FAIL${reset}\n"
	  echo "  Potential fixes:"
	  echo "    - [OS X] run 'boot2docker ssh -L4001:4001:localhost:4001' or 'ssh -i ~/.docker/machine/machines/docker-vm/id_rsa -f -N -L 4001:localhost:4001 docker@192.168.99.100"
	fi
	echo ""

	printf "Verifying k8s API SSH tunnel for docker-machine: "
	k8s_tunnel_up=$(ps -eaf | grep ssh | grep "8080:localhost:8080")
	if [ -n "$k8s_tunnel_up" ]; then
		printf "${green}   ${checkmark} PASS${reset}\n"
	else
	  printf "${red}   ${error} FAIL${reset}\n"
	  echo "  Potential fixes:"
	  echo "    - [OS X] run 'boot2docker ssh -L8080:localhost:8080' or 'ssh -i ~/.docker/machine/machines/docker-vm/id_rsa -f -N -L 8080:localhost:8080 docker@192.168.99.100"
	fi
	echo ""
fi

#
# Verify k8s master
#
printf "Verifying Kubernetes Master: "
output=`curl -s localhost:8080/healthz`
if [ "$output" == "ok" ]; then
	printf "${green}   ${checkmark} PASS${reset}\n"
else
  printf "${red}   ${error} FAIL${reset}\n"

  echo "  Potential fixes:"
  echo "    - [OS X] Ensure route exists: sudo route -n add 10.0.0.0/16 192.168.59.103"
  echo "    - [OS X] Ensure port forward is open: boot2docker ssh -L8080:localhost:8080"
fi
echo ""

#
# Verify connectivity to DNS
#
if [ "$check_k8s_dns" -eq 1 ]; then
	printf "Verifying K8S DNS Connectivity: "
	output=`dig @${dns_server} +short kubernetes.default.svc.cluster.local`
	if [ "$output" == "10.0.0.1" ]; then
		printf "${green}   ${checkmark} PASS${reset}\n"
	else
	  printf "${red}   ${error} FAIL${reset}\n"

	  echo "  Potential fixes:"
	  echo "    - [ALL]  Restart kube2sky because it often hangs : docker ps | grep kube2sky | awk -F' ' '{ print \$1 }' | xargs docker   restart"
	  echo "    - [OS X] Ensure route exists: sudo route -n add 10.0.0.0/16 192.168.59.103"

	fi
	echo ""
fi


#
# Verify DNS resolution works
#
if [ "$check_host_dns" -eq 1 ]; then
	echo "Verifying DNS Resolution: "
	for h in "${hosts[@]}"
	do
		output=`dig @${dns_server} +short ${h}.${RIOX_ENV}.svc.cluster.local 2>/dev/null`
		printf "   %-30s " "$h.${RIOX_ENV}.svc.cluster.local:"
		if [ -z "$output" ]; then
			printf "${red}   ${error} FAIL${reset}\n"
		else
			printf "${green}   ${checkmark} PASS${reset}\n"
		fi
	done

	echo ""
fi

#
# Verify luarocks
#
if [ "$check_lua_env" -eq 1 ]; then
	printf "Verifying Luarocks: \n"
	luarocks=$(which luarocks-5.1)
	if [ -z "$luarocks" ]; then
		luarocks=$(which luarocks)
		if [ -z "$luarocks" ]; then
			printf "${red}   ${error} FAIL${reset}\n"
		else
			printf "${green}   ${checkmark} PASS${reset}\n"
		fi
	fi

	for lib in "${lua_libs[@]}"
	do
		exists=$(${luarocks} list 2> /dev/null | grep ${lib})
		if [ -z "$exists" ]; then
			printf "${red}   ${error} FAIL: lua library '${lib}' not installed. Use '${luarocks} install ${lib}' to fix ${reset}\n"
		else
			printf "${green}   ${checkmark} PASS: '${lib}' exists ${reset}\n"
		fi
	done
fi

echo ""

#
# Verify openresty
#
if [ "$check_openresty" -eq 1 ]; then
	printf "Verifying Openresty (sudo required): "
	openresty=$(which openresty)
	if [ -z "$openresty" ]; then
		printf "${red}   ${error} FAIL${reset}\n"

		echo "  Potential fixes:"
		echo "    - [Linux] Install openresty: see https://github.com/riox/riox/blob/develop/docs/Developing.md"
		echo "    - [OS X]  Install openresty: brew install lua51 luajit homebrew/nginx/openresty"
	else
		$(sudo ${openresty} -t 2&>1 /dev/null)

		if [ "$?" -eq 1 ]; then
			printf "${red}   ${error} FAIL${reset}\n"
			echo "  Potential fixes:"
			echo "    - [ALL]  Verify that you are in sudoers file and that openresty config is OK"
		else
			printf "${green}   ${checkmark} PASS${reset}\n"
		fi
	fi
fi

echo ""

#
# Verify zookeeper is UP if we started kafka
#
containsElement "kafka" "${hosts[@]}"
if [ $? -eq 0 ]; then
	printf "Verifying Zookeeper is working:  "
	output=`echo ruok | nc zookeeper.${RIOX_ENV}.svc.cluster.local 2181 2&>1 > /dev/null`
	if [ "$output" == "imok" ]; then
		printf "${green}   ${checkmark} PASS${reset}\n"
	else
		printf "${red}   ${error} FAIL${reset}\n"
	fi


fi

