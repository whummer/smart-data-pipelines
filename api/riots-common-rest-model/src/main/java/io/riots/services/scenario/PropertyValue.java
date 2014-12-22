package io.riots.services.scenario;

import io.riots.services.catalog.Property;
import io.riots.services.model.EventProperty;
import io.riots.services.model.interfaces.ObjectIdentifiable;

/**
 * Represents the concrete value of a {@link Property}, e.g., an
 * {@link EventProperty} within an {@link Event}.
 * 
 * @author Waldemar Hummer
 */
public class PropertyValue<T> implements ObjectIdentifiable {

	private String id;

	private String thingId;

	private String propertyName;

	private T value;

	double timestamp;

	public PropertyValue() {
	}

	public PropertyValue(T value) {
		this(null, value);
	}

	public PropertyValue(Property property, T value) {
		this.propertyName = property.getName();
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
	public T getValue() {
		return value;
	}
	public void setValue(T value) {
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
