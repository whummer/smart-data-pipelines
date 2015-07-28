## Release Engineering

At Riox we strongly believe in "Continuous Delivery". We deploy every push to
the `develop` branch and test it end-to-end.

### Overview of the release process

1. Code in the `develop` branch is work in progress. We leverage pull requests
   to get code into `develop` which gets automatically tested by a test pipeline
   in [http://ci.riox.io](our Jenkins server). If the test passes, the `develop`
   branch is in *good state*.

1. The pipeline produces one Docker image called [https://registry.hub.docker.com/u/riox/hyperriox/](`hyperriox`)
   that contains all services. The image is tagged with either `latest`
   or a specific `VERSION` in case it is released to staging.

1. We track the version  update the VERSION file  `develop` and

### Create a new staging release

1. Assume that we have code in the `develop` branch that we want to release to
   our [staging area](http://demo.riox.io).

1. Run a dev build or at least ensure that the last one succeeded.

1. Tag the current `develop` branch

    ```
    git tag -a v`cat VERSION` -m '<meaningful description>'
    ```

1. Commit and push the VERSION file to `develop` and ensure the test run succeeds (which should be the case if it succeeded before, otherwise file an issue).

1. Push the tag to the origin

   ```
   git push origin v`cat VERSION`
   ```

1. Trigger the Jenkins staging build manually:

1. Watch and ensure the build succeeds. If it does not we have to roll back.
   **This is still TBD**
