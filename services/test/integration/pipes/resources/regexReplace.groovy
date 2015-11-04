import groovy.json.*
import java.util.*

targetField = !targetField ? field : targetField

/*
 * Need to put the functionality into a separate class, because when 
 * we execute the script later it may be executed from an arbitrary 
 * generated file name, e.g., 123abc, and groovy automatically uses 
 * the filename as class name if no class exists.
 * -> Results in "ClassFormatError: Illegal class name Exception"
 */
class Utils {
	String field
	String targetField
	String payload
	String regex
	String replace

	Map processMap(map) {
		for(def key : map.keySet().collect()) {
			if(key.equals(field)) {
				def value = map.get(key).replaceAll(regex, replace)
				map.put(targetField, value)
			}
		}
		return map
	}
	List processList(list) {
		for(def i = 0; i < list.size(); i ++) {
			def item = processMap(list.get(i))
			list.set(i, item)
		}
		return list
	}
	Object parseJSON(payload) {
		def jsonSlurper = new JsonSlurper()
		def val = jsonSlurper.parseText(payload)
		return val
	}

}

// INIT VALUES
def utils = new Utils();
utils.field = field
utils.targetField = targetField
utils.payload = payload
utils.regex = regex
utils.replace = replace

if(payload instanceof String) {
	payload = utils.parseJSON(payload)
}

try {
	if(payload instanceof Map) {
		payload = utils.processMap(payload)
	} else if(payload instanceof List) {
		payload = utils.processList(payload)
	} else {
		println("WARN: Unexpected payload type " + payload)
	}
} catch (Throwable ex) {
	println("ERROR: " + ex);
	return payload
}

return payload