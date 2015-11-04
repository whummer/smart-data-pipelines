import groovy.json.*
def jsonSlurper = new JsonSlurper()

def object = payload
try {
	object = jsonSlurper.parseText(payload)
	object[key] = value
	object = new java.util.HashMap(object)
} catch(all) {
	println("ERROR: Unable to execute script: " + all);
}

return object;