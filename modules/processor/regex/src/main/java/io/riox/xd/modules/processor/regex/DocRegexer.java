package io.riox.xd.modules.processor.regex;

import java.util.Map;

import org.apache.commons.lang.StringUtils;

public class DocRegexer {

	public static void replace(Map<String,Object> obj, String field, String regex, String replace) {
		replace(obj, field, regex, replace, field);
	}
	public static void replace(Map<String,Object> obj, String field, String regex, String replace, String targetField) {
		Object value = obj.get(field);
		if(value == null)
			return;
		String s = value.toString();
		if(StringUtils.isEmpty(targetField))
			targetField = field;
		obj.put(targetField, s.replaceAll(regex, replace));
	}

}
