package io.riots.core.util;

import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Simple JSON utilities, wrappers around Jackson.
 * @author hummer
 */
public class JSONUtil {

	public static String toJSON(Object o) {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.writeValueAsString(o);
		} catch (JsonProcessingException e) {
			throw new RuntimeException();
		}
	}

	public static <T> T fromJSON(String o, Class<T> clazz) {
		ObjectMapper mapper = new ObjectMapper();
		try {
			return mapper.readValue(o, clazz);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

	@SuppressWarnings("unchecked")
	public static Map<String,?> clone(Object o) {
		return clone(o, Map.class);
	}
	public static <T> T clone(Object o, Class<T> targetClass) {
		return JSONUtil.fromJSON(JSONUtil.toJSON(o), targetClass);
	}
}
