package io.riots.api.services.scenarios;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.api.services.catalog.Property;
import io.riots.api.services.model.EventProperty;
import io.riots.api.services.model.interfaces.ObjectIdentifiable;

/**
 * Represents the concrete value of a {@link Property}, e.g., an
 * {@link EventProperty} within an {@link Event}.
 * 
 * @author Waldemar Hummer
 */
public class PropertyValue implements ObjectIdentifiable {

	@JsonProperty
	private String id;

	@JsonProperty("thing-id")
	private String thingId;

	@JsonProperty("property")
	private String propertyName;

	@JsonProperty
	private Object value;

	@JsonProperty
	private long timestamp;

	public PropertyValue() {
	}

	public PropertyValue(String thingId, String propertyName, Object value, long timestamp) {
		this.thingId = thingId;
		this.propertyName = propertyName;
		this.value = value;
		this.timestamp = timestamp;
	}

	public PropertyValue(Object value) {
		this((Property)null, value);
	}

	public PropertyValue(Property property, Object value) {
		this(property, value, 0);
	}
	public PropertyValue(Property property, Object value, long time) {
		this(null, property, value, time);
	}
	public PropertyValue(String thingId, Property property, Object value, long time) {
		if(property != null) {
			this.propertyName = property.getName();
		}
		this.value = value;
		this.timestamp = time;
		this.thingId = thingId;
	}

	public PropertyValue(PropertyValue propValueTemplate, Object value) {
		this.id = propValueTemplate.id;
		this.propertyName = propValueTemplate.propertyName;
		this.thingId = propValueTemplate.thingId;
		this.timestamp = propValueTemplate.timestamp;
		this.value = value;
	}

	public String getId() {
		return id;
	}
	public String getThingId() {
		return thingId;
	}
	public void setThingId(String thingId) {
		this.thingId = thingId;
	}
	public String getPropertyName() {
		return propertyName;
	}
	public void setPropertyName(String propertyName) {
		this.propertyName = propertyName;
	}
	public Object getValue() {
		return value;
	}
	public void setValue(Object value) {
		this.value = value;
	}
	public long getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	/**
	 * Return the name part after the last dot "." (if
	 * a dot exists in the name at all)
	 * @return
	 */
	@JsonIgnore
	public String getLocalName() {
		if(propertyName == null || !propertyName.contains("."))
			return propertyName;
		return propertyName.substring(propertyName.lastIndexOf("."),
				propertyName.length() - 1);
	}

	@Override
	public String toString() {
		return "PropVal[" + propertyName + "=" + value + "]";
	}
}
