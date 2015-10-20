## Elasticsearch Sink for Spring Cloud Data Flow

This very simple [Elasticsearch](http://www.elastic.co) Sink implementation for Spring Cloud Data Flow
is based on the [Spring-XD version](https://github.com/mbogoevici/elasticsearch-sink) contributed by Marius Bogoevici.

## Build, Install and Deploy

To build this sink, follow standard maven protocol:

```
mvn clean package
```

Please note that for the `transport` mode integration tests you need a local Elasticsearch instance up and
running on port `9300`.

Moreover make sure that you have all the required snapshot repositories enabled. In a nutshell,
start with the following `settings.xml` (put it in `~/.m2`)

```
<?xml version="1.0" encoding="UTF-8"?>
<settings>
	<servers>
		<server>
			<id>repo.spring.io</id>
			<username>${env.CI_DEPLOY_USERNAME}</username>
			<password>${env.CI_DEPLOY_PASSWORD}</password>
		</server>
	</servers>
	<profiles>
		<profile>
			<id>spring</id>
			<activation>
				<activeByDefault>true</activeByDefault>
			</activation>
			<repositories>
				<repository>
					<id>spring-snapshots</id>
					<name>Spring Snapshots</name>
					<url>http://repo.spring.io/libs-snapshot-local</url>
					<snapshots>
						<enabled>true</enabled>
					</snapshots>
				</repository>
				<repository>
					<id>spring-milestones</id>
					<name>Spring Milestones</name>
					<url>http://repo.spring.io/libs-milestone-local</url>
					<snapshots>
						<enabled>false</enabled>
					</snapshots>
				</repository>
				<repository>
					<id>spring-releases</id>
					<name>Spring Releases</name>
					<url>http://repo.spring.io/libs-release</url>
					<snapshots>
						<enabled>false</enabled>
					</snapshots>
				</repository>

			</repositories>
			<pluginRepositories>
				<pluginRepository>
					<id>spring-snapshots</id>
					<name>Spring Snapshots</name>
					<url>http://repo.spring.io/libs-snapshot-local</url>
					<snapshots>
						<enabled>true</enabled>
					</snapshots>
				</pluginRepository>
				<pluginRepository>
					<id>spring-milestones</id>
					<name>Spring Milestones</name>
					<url>http://repo.spring.io/libs-milestone-local</url>
					<snapshots>
						<enabled>false</enabled>
					</snapshots>
				</pluginRepository>
			</pluginRepositories>
		</profile>
	</profiles>
</settings>
```

To push the maven artifacts (the fat JAR) to AWS maven, execute the `deploy` maven target:

```
mvn deploy
```

Please note that you have to provide valid credentials for the S3 maven repos, so put the following
into your `settings.xml` into the `servers` section:

```
<server>
	<id>maven-s3-release-repo</id>
	<username>*****************</username>
	<password>*****************</password>
</server>
<server>
	<id>maven-s3-snapshot-repo</id>
	<username>*****************</username>
	<password>*****************</password>
</server>
```
