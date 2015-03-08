package io.riots.core.util;

import io.riots.api.services.scenarios.PropertyValue;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Functionality for dealing with properties and sub-properties.
 * @author whummer
 */
public class PropertyUtil {

	public static List<PropertyValue> getChildren(PropertyValue prop) {
		List<PropertyValue> result = new LinkedList<PropertyValue>();
		if(prop.getValue() instanceof Map<?,?>) {
			@SuppressWarnings("unchecked")
			Map<String,?> values = (Map<String,?>)prop.getValue();
			for(String key : values.keySet()) {
				String name = prop.getPropertyName() + "." + key;
				PropertyValue v = new PropertyValue(
						prop.getThingId(), name, values.get(key),
						prop.getTimestamp());
				result.add(v);
			}
		}
		return result;
	}

}
