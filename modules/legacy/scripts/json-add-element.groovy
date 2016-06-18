import groovy.json.*
def jsonSlurper = new JsonSlurper()
def object = jsonSlurper.parseText(payload)

object[key] = value;
return object;
