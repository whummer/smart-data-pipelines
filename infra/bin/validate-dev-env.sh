#!/bin/bash

dir=`dirname "$0"`
me=`basename $0`
source $dir/common.sh

: ${RIOX_ENV:=development}

# define hosts to check DNS for
declare -a hosts=('mongo' 'redis-sentinel'  'riox-ui' 'users-service' 'organizations-service' 'access-service' \
 'files-service' 'notifications-service'  'certificates-service' 'ratings-service' 'statistics-service' \
 'gateway-service' 'proxies-service' 'pipes-service');

# define required luarocks (for openresty)
declare -a lua_libs=('luasocket' 'ansicolors' 'luasec' 'lua-cjson' 'busted' 'lapis' 'moonscript' 'inspect' 'luajwt');

# cluster DNS IP
declare dns_server=10.0.0.10

# openresty config file
declare openresty_config=nginx.dev.conf

# cli arguments
check_routing=1
check_host_dns=1
check_k8s_dns=1
check_lua_env=1
check_openresty=1
check_redx=1
silent=1

read -r -d '' HELP_TEXT <<'USAGE_TEXT'
Available options are:
	-d  disable k8s DNS check
	-h  disable host DNS check (mongo, redis etc.)
	-l  disable LUA checks
	-o  disable openresty checks
	-x  disable redx checks
	-r  disable route checks
	-s  silent mode
	-?  show this help text
USAGE_TEXT

function show_help {
	echo "Usage: $me [-dhloxrs?]"
	echo "$HELP_TEXT"
		exit 0
}

while getopts "dhloxrs?:" opt; do
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
	r)  check_route=0
		;;
	x)  check_redx=0
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

	if [ "$check_route" -eq 1 ]; then
		docker_net=${DOCKER_MACHINE_NET:=10.0.0.0/16}
		docker_machine_ip=$(docker-machine ip docker-vm)
		if [ $? -ne 0 ]; then
			exit -1;
		fi

		rx='([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])'
		printf "Verifying routing:"

		if [[ $docker_machine_ip =~ ^$rx\.$rx\.$rx\.$rx$ ]]; then
			default_gateway=$(route -n get default | grep gateway | awk '{print $2}')
			existing_route_gateway=$(route -n get $docker_net | grep gateway | awk '{print $2}')
			if [ "$existing_route_gateway" == "$docker_machine_ip" ]; then
				printf "${green}   ${checkmark} PASS\n${reset}"
			else
				printf "${red}    ${error} FAIL\n${reset}"
			fi
		else
			printf "${red}   ${error} FAIL: No valid IP address for docker machine $machine_name: $docker_machine_ip\n\n${reset}"
		fi
	fi

	echo ""
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
	output=`dig @${dns_server} +time=1 +tries=1 +short kubernetes.default.svc.cluster.local`
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
		output=`dig @${dns_server} +time=1 +tries=1 +short ${h}.${RIOX_ENV}.svc.cluster.local 2>/dev/null`
		printf "   %-30s " "$h.${RIOX_ENV}.svc.cluster.local:"
		if [ -z "$output" ] || [[ "$output" =~ "connection timed out" ]]; then
			printf "${red}   ${error} FAIL${reset}\n"
		else
			printf "${green}   ${checkmark} PASS ${reset}\n"
		fi
	done

	echo ""
fi

#
# Verify luarocks
#
if [ "$check_lua_env" -eq 1 ]; then
	printf "Verifying Luarocks (binary): "
	luarocks=$(which luarocks-5.1)
	if [ -z "$luarocks" ]; then
		luarocks=$(which luarocks)
		if [ -z "$luarocks" ]; then
			printf "${red}   ${error} FAIL${reset}\n"
		else
			printf "${green}   ${checkmark} PASS${reset}\n"
		fi
	else
		printf "${green}   ${checkmark} PASS${reset}\n"
	fi

	echo ""

	printf "Verifying Luarocks (libraries): \n"
	for lib in "${lua_libs[@]}"
	do
		exists=$(${luarocks} list 2> /dev/null | grep ${lib})
		if [ -z "$exists" ]; then
			printf "${red}   ${error} FAIL: lua library '${lib}' not installed. Use '${luarocks} install ${lib}' to fix ${reset}\n"
		else
			printf "${green}   ${checkmark} PASS: '${lib}' exists ${reset}\n"
		fi
	done

	echo ""

	printf "Verifying LUA_PATH: "
	if [ -z "$LUA_PATH" ] || [ -z "$LUA_CPATH" ]; then
		printf "${yellow}   ${warning} LUA_PATH and/or LUA_CPATH are not set, might cause trouble ${reset}\n"
	else
		printf "${green}   ${checkmark} PASS${reset}\n"
	fi
fi

echo ""

#
# Verify openresty
#
if [ "$check_openresty" -eq 1 ]; then
	#printf "Verifying Openresty config (sudo required): "
	#openresty=$(which openresty)
	#if [ -z "$openresty" ]; then
		#printf "${red}   ${error} FAIL${reset}\n"
	#else
		#$(sudo ${openresty} -t -c ${openresty_config} 2> /dev/null)
#
		#if [ "$?" -eq 1 ]; then
			#printf "${red}   ${error} FAIL${reset}\n"
			#echo "  Potential fixes:"
			#echo "    - [ALL]  Verify that you are in sudoers file and that openresty config is OK"
		#else
			#printf "${green}   ${checkmark} PASS${reset}\n"
		#fi
	#fi

	echo ""
	printf "Verifying Openresty is running: "
	openresty_running=$(ps -eaf | grep openresty | grep -v grep)
	if [ -z "$openresty_running" ]; then
		printf "${red}   ${error} FAIL${reset}\n"
		echo "  Potential fixes:"
		echo "    - [ALL]  start openresty via 'sudo openresty -c nginx.dev.conf'"
	else
		printf "${green}   ${checkmark} PASS${reset}\n"
	fi
fi

echo ""


#
# verify redx
#
printf "Verifying redx is up2date"
if [ "$check_redx" -eq 1 ]; then
	changed=`git pull --dry-run | grep -q -v 'Already up-to-date.'`
	if [ -n "$changed" ]; then
		printf "${red}   ${error} FAIL${reset}\n"
		echo "  Potential fixes:"
		echo "    - [ALL]  execute: cd /opt/redx && git pulll"
	else
		printf "${green}   ${checkmark} PASS${reset}\n"
	fi
fi




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
