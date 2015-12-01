#!/bin/bash

##
# This script performs a rolling upgrade of the services deployed in the staging environment.
#
# Here is the main synopis:
# 1. Developers have to increment to VERSION file to "signal" a new version for rollout. If
#    the VERSION of a build is the same as in the previous builds, nothing will happen. We
#    can check this by checking if a git tag exists for the given SHA1. If it does, it means
#    the previous version has been rolled out before.
# 2. We get a SHA1 if of the last successful build. This means that a hyperriox docker
#    image was created and tested and tagged with a particular SHA1 hash (the input to this script).
# 3. We create a git tag with the desired VERSION of the given SHA1 hash. Then we tag
#    the image with the given SHA1 in the docker registry with the VERSION (e.g., v1.0.1).
#    Now we have tagged the git repo and the docker image that we know is in good state for a rollout
# 4. We perform a rolling upgrade of all Kubernetes pods with the rolling-upgrade command.
# 5. Once this succeeds, we run selenium UI tests against the deployment to verify the UI works.
# 6. [FUTURE] We roll back the release in case the UI tests fail.
##

: ${sha1?"Need to set sha1 to last successfully tested commit"}

BASEDIR=`dirname $0`

export RIOX_ENV=staging
export VERSION=v`cat $BASEDIR/../../VERSION`
IMAGE=riox/hyperriox

if [[ $sha1 != "develop" ]]; then
	echo "Aborting: we are only rolling out branch 'develop' to staging (no PRs or other branches)"
	exit 0
fi

# Check if rolling upgrade is required by: if the VERSION in the
# source tree has not been tagged before (i.e. a git tag in origin exists),
# then we need to roll out

tag_code=`git ls-remote --exit-code origin refs/tags/$VERSION`
if [[ $? -eq 0 ]]; then
	echo "Git tag for version ${VERSION} already exists. No rollout required. Phewww :)."
	exit 0
fi

echo "No Git tag ${VERSION} found."

echo "###"
echo "Performing rolling upgrade to $VERSION ..."
echo "###"

# Create the git tag (forced locally) and push it
git tag -a ${VERSION} -f -m "Staging release tag for ${VERSION}"
git push origin ${VERSION}

# Tag the docker image with the git tag
echo "Tagging image ${IMAGE}:${GIT_COMMIT} with new tag ${IMAGE}:${VERSION}"
docker tag ${IMAGE}:${GIT_COMMIT} ${IMAGE}:${VERSION}
docker push ${IMAGE}:${VERSION}

(cd $BASEDIR/../../ && RIOX_ENV=staging IMAGE_VERSION=${VERSION} make rolling-update)

sleep 15


echo "###"
echo "Running selenium tests"
echo "###"
(cd $BASEDIR/../../e2e/selenium/e2e.ui && mvn -Driox.endpoint="http://demo.riox.io" -Driox.env=staging test)
