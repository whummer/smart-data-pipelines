#!/bin/bash

(cd api/ && mvn install -DskipTests) && (cd api/riots-webapp/ && mvn tomcat7:run)

