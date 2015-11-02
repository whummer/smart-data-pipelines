#!/bin/bash

BASEDIR=`dirname $0`

REPO_URL=https://repo.spring.io/libs-snapshot
GROUP_ID=org.springframework.cloud.stream.module
VERSION=1.0.0.BUILD-SNAPSHOT

# ADD NEW MODULES HERE!!
MODULES=( \
	counter-sink \
	file-sink\
	filter-processor \
	ftp-source \
	gemfire-sink \
	groovy-filter-processor \
	groovy-transform-processor \
	hdfs-sink \
	http-source \
	log-sink \
	redis-sink \
	script-variable-generator \
	sftp-source \
	time-source \
	transform-processor \
	twitterstream-source \
)

mkdir ${BASEDIR}/jars
mkdir ${BASEDIR}/dockerfiles

for module in "${MODULES[@]}"
do
	echo "Fetching module: ${module}"
	mvn org.apache.maven.plugins:maven-dependency-plugin:get \
			-DremoteRepositories=${REPO_URL} \
			-DgroupId=${GROUP_ID} \
			-DartifactId=${module} \
			-Dversion=${VERSION} \
			-Dclassifier=exec \
			-Dpackaging=jar \
			-Dtransitive=false \
			-Ddest=${BASEDIR}/jars/${module}.jar

	echo "Building docker image for '${module}'"
	dockerfile=dockerfiles/Dockerfile-${module}
	MODULE_NAME=${module} ${BASEDIR}/../../util/templater.sh Dockerfile.tmpl > ${dockerfile}
	image=riox/spring-cloud-stream-module-${module}:${VERSION}
	docker build -t ${image} -f ${dockerfile} .

	echo "Building docker image '${image}'"
	docker push ${image}
done
