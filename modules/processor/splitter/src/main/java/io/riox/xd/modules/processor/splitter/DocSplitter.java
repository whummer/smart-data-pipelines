package io.riox.xd.modules.processor.splitter;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DocSplitter {

	private static final Logger LOG = LoggerFactory.getLogger(DocSplitter.class);

	public static List<Map<String,Object>> map(Map<String,Object> object, String mapDefinition) {
		String[] parts = mapDefinition.split("\\s*:\\s*");
		String targetIdField = "id";
		String sourceFieldRegex, targetValueField;
		if(parts.length >= 3) {
			sourceFieldRegex = parts[0];
			targetIdField = parts[1];
			targetValueField = parts[2];
		} else {
			sourceFieldRegex = parts[0];
			targetValueField = parts[1];
		}
		return map(object, sourceFieldRegex, targetIdField, targetValueField);
	}

	private static List<Map<String,Object>> map(Map<String,Object> object, String sourceFieldRegex, 
			String targetIdField, String targetValueField) {
		List<Map<String,Object>> result = new LinkedList<Map<String,Object>>();
		for(String key : object.keySet()) {
			if(key.matches(sourceFieldRegex)) {
				result.add(extract(object, key, sourceFieldRegex, targetIdField, targetValueField));
			}
		}
		LOG.info("Mapping: regex: " + sourceFieldRegex + ", id field: " + targetIdField + 
				", value field: " + targetValueField + ". Results: " + result.size());
		return result;
	}

	private static Map<String,Object> extract(Map<String,Object> sourceObject, String sourceField, 
			String sourceFieldRegex, String targetIdField, String targetValueField) {
		Map<String,Object> result = new HashMap<String, Object>();
		for(String key : sourceObject.keySet()) {
			if(!key.matches(sourceFieldRegex)) {
				result.put(key, sourceObject.get(key));
			}
		}
		result.put(targetIdField, sourceField);
		result.put(targetValueField, sourceObject.get(sourceField));
		return result;
	}

}
