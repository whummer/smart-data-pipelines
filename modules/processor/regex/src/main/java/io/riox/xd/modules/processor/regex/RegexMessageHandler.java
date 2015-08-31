
package io.riox.xd.modules.processor.regex;

import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import net.minidev.json.parser.JSONParser;

/**
 * MessageHandler implementation for regex replacer.
 *
 * @author: Waldemar Hummer (whummer)
 */
public class RegexMessageHandler {

	/**
	 * Option "field" (see {@link RegexProcessorOptionMetadata})
	 */
	private volatile String field = null;
	/**
	 * Option "targetField" (see {@link RegexProcessorOptionMetadata})
	 */
	private volatile String targetField = null;

	/**
	 * Option "regex" (see {@link RegexProcessorOptionMetadata})
	 */
	private volatile String regex = null;

	/**
	 * Option "replace" (see {@link RegexProcessorOptionMetadata})
	 */
	private volatile String replace = null;

	private final JSONParser json = new JSONParser(JSONParser.DEFAULT_PERMISSIVE_MODE);

	@SuppressWarnings("unchecked")
	public <T> T transform(String payload) {
		try {
			Map<String, Object> obj = (Map<String,Object>)json.parse(payload);
			return transform(obj);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(List<Map<String, Object>> payload) {
		for(Map<String,Object> item : payload) {
			DocRegexer.replace(item, field, regex, replace, targetField);
		}
		return (T) payload;
	}

	@SuppressWarnings("unchecked")
	public <T> T transform(Map<String, Object> payload) {
		if(!StringUtils.isEmpty(field)) {
			DocRegexer.replace(payload, field, regex, replace, targetField);
			return (T) payload;
		}
		return (T) payload;
	}

	/* GETTERS / SETTERS */

	public void setField(String field) {
		this.field = field;
	}
	public void setRegex(String regex) {
		this.regex = regex;
	}
	public void setReplace(String replace) {
		this.replace = replace;
	}
	public void setTargetField(String targetField) {
		this.targetField = targetField;
	}
}
