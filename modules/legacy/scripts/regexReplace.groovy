/* Note: do NOT change the name of this file to contain dashes, or we run into this runtime error:

   	ERROR: java.lang.ClassFormatError: Illegal class name "regex-replace$processList$1" in class file regex-replace$processList$1
	java.lang.ClassFormatError: Illegal class name "regex-replace$processList$1" in class file regex-replace$processList$1
		at java.lang.ClassLoader.defineClass1(Native Method)
		at java.lang.ClassLoader.defineClass(ClassLoader.java:760)
		...
*/

import groovy.json.*

targetField = !targetField ? field : targetField

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
	return jsonSlurper.parseText(payload)
}

if(payload instanceof String) {
	payload = parseJSON(payload)
}

try {
	if(payload instanceof Map) {
		payload = processMap(payload)
	} else if(payload instanceof List) {
		payload = processList(payload)
	}
} catch (Throwable ex) {
	println("ERROR: " + ex);
	return payload
}

return payload
