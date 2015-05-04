# Spring XD Admin
This Docker image runs a Spring XD Admin server in [distributed mode](http://docs.spring.io/spring-xd/docs/1.0.0.BUILD-SNAPSHOT/reference/html/#running-distributed-mode). It expects
to connect to a ZooKeeper ensemble, an HSQLDB server and a Redis instance using
environment variables that adhere to the Docker link conventions.


Sample usage, assuming other Docker containers are running:

	docker run --name admin \
	    --link zookeeper:zookeeper \
	    --link hsqldb:hsqldb \
	    --link redis:redis \
	    -d \
	    -P \
	    springxd/admin