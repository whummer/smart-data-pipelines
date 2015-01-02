package io.riots.services.scenario;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.riots.services.catalog.Property;
import io.riots.services.model.EventProperty;
import io.riots.services.model.interfaces.ObjectIdentifiable;

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
	private double timestamp;

	public PropertyValue() {
	}

	public PropertyValue(Object value) {
		this((Property)null, value);
	}

	public PropertyValue(Property property, Object value) {
		if(property != null) {
			this.propertyName = property.getName();
		}
		this.value = value;
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
	public double getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(double timestamp) {
		this.timestamp = timestamp;
	}

	@Override
	public String toString() {
		return "PropVal[" + propertyName + "=" + value + "]";
	}
}
