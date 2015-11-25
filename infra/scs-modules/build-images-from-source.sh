#!/bin/bash

# colors
red=$(tput setaf 1)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
reset=$(tput sgr0)

# icons
checkmark="\xE2\x9C\x93"
warning="\xE2\x9A\xA0"
error="\xE2\x9C\x97"

function bailOut {
  message=$1
  printf "${red} ${error}  $message${reset}\n"
  exit -1
}

#
# cli args
#
skip_tests=0
skip_push=0
skip_cleanup=0
verbose=0

read -r -d '' HELP_TEXT <<'USAGE_TEXT'
Available options are:
	-t  skip Maven tests (-DskipTests)
	-c  skip cleanup (rm -rf __tmp)
	-p  don't push images
	-v  verbose output
	-?  show this help text
USAGE_TEXT

function show_help {
	echo "Usage: $me [-tcv?]"
	echo "$HELP_TEXT"
    exit 0
}

while getopts "tcvp?:" opt; do
    case "$opt" in
    \?) show_help
        exit 0
        ;;
    t)  skip_tests=1
        ;;
    c)  skip_cleanup=1
        ;;
    p)  skip_push=1
        ;;
	v)  verbose=1
		;;
    esac
done


#
# settings
#
BASEDIR=${PWD}
REPO_NAME=spring-cloud-stream-modules
REPO_URL=https://github.com/spring-cloud/spring-cloud-stream-modules.git
TEMP_DIR="$BASEDIR/__tmp"
DOCKERFILES_DIR="$TEMP_DIR/dockerfiles"
JARS_DIR="$DOCKERFILES_DIR/jars"
BINDER=kafka
VERSION="1.0.0.${BINDER}.BUILD-SNAPSHOT"
MVN_OPTS=""
if [ "$skip_tests" -eq 1 ]; then
	MVN_OPTS="-DskipTests"
fi

#
# create temp dirs
#
mkdir -p $DOCKERFILES_DIR 2>&1 > /dev/null || bailOut "Cannot create $DOCKERFILES_DIR"
mkdir -p $TEMP_DIR 2>&1 > /dev/null || bailOut "Cannot create $TEMP_DIR"
mkdir -p $JARS_DIR 2>&1 > /dev/null || bailOut "Cannot create $JARS_DIR"

#
# clone the spring-cloud-stream-modules repository
#
printf "%-70s" "${yellow}Checking out spring cloud stream modules source...${reset}"
cd $TEMP_DIR
git_output=$(git clone $REPO_URL 2>&1)
if [ "$?" -eq 0 ]; then
	printf "${green} ${checkmark} Clone success${reset}\n\n";
else
	printf "${red} ${error} Clone failed:: $git_output${reset}\n\n";
	exit -1;
fi

#
# patch the parent pom (use kafka instead of redis for binder)
#
cd $REPO_NAME
printf "%-70s" "${yellow}Patching parent pom.xml for Kafka binder support...${reset}"
patch_output=$(patch < ${BASEDIR}/kafka-binder.patch)
if [ "$?" -eq 0 ]; then
	printf "${green} ${checkmark} Patch success${reset}\n\n";
else
	printf "${red} ${error} Patch failed: $patch_output${reset}\n\n";
	exit -1;
fi

#
# build the maven project
#
printf "%-70s" "${yellow}Building cloud stream modules from source...${reset}"
mvn_output=$(mvn ${MVN_OPTS} -s .settings.xml package 2>&1)
if [ "$?" -eq 0 ]; then
	printf "${green} ${checkmark} Build success${reset}\n\n";
else
	printf "${red} ${error} Build failed: $mvn_output${reset}\n\n";
	exit -1;
fi


#
# process all modules except 'common'
#
MODULE_GLOB=$(find . -type d -d 1 -not -name 'common' -not -name '.*')

for module in ${MODULE_GLOB}
do
	module_basename=`basename $module`
	printf "%-70s" "${yellow}Processing module '${module_basename}'${reset}..."
	dockerfile=$DOCKERFILES_DIR/Dockerfile-${module_basename}
	image=riox/spring-cloud-stream-module-${module_basename}:${VERSION}
	jar_file=$(find $module -name "*-exec.jar")
	cp $jar_file $JARS_DIR/

	jar_file_basename=`basename $jar_file`
	final_jar_name="jars/${jar_file_basename}"
	MODULE_NAME=${final_jar_name} ${BASEDIR}/../../util/templater.sh ${BASEDIR}/Dockerfile_Kafka.tmpl > ${dockerfile}

	#
	# build Docker image
	#
	build_output=$(docker build -t ${image} -f ${dockerfile} $DOCKERFILES_DIR 2>&1)
	if [ "$?" -eq 0 ]; then
		printf "${green} ${checkmark} Build success${reset}  ";
	else
		printf "${red} ${error} Build failed: $build_output ${reset}\n";
		exit -1;
	fi

	#
	# push Docker image to registry
	#
	if [ "$skip_push" -eq 0 ]; then
		push_output=$(docker push ${image} 2>&1)
		if [ "$?" -eq 0 ]; then
			printf "${green} ${checkmark} Push success${reset}";
		else
			printf "${red} ${error} Push to docker registry failed: ${push_output}${reset}\n";
			exit -1;
		fi
	fi

	echo ""

done

#
# cleanup
#
cd ..
if [ "$skip_cleanup" -eq 0 ]; then
	rm -rf $TEMP_DIR $DOCKERFILES_DIR
fi
