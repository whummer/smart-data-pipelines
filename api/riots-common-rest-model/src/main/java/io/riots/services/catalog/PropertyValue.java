package io.riots.services.catalog;

import io.riots.services.model.EventProperty;

/**
 * Represents the concrete value of a {@link Property}, e.g., an
 * {@link EventProperty} within an {@link Event}.
 * 
 * @author Waldemar Hummer
 */
public class PropertyValue<T> {

	private Property property;

	private T value;

	public PropertyValue() {
	}

	public PropertyValue(T value) {
		this(null, value);
	}

	public PropertyValue(Property property, T value) {
		this.property = property;
		this.value = value;
	}

	public Property getProperty() {
		return property;
	}

	public void setProperty(Property property) {
		this.property = property;
	}

	public T getValue() {
		return value;
	}

	public void setValue(T value) {
		this.value = value;
	}

	@Override
	public String toString() {
		return "PropVal[" + property + "=" + value + "]";
	}
}
