package io.riots.catalog.model;

import io.riots.services.model.EventProperty;

/**
 * Represents the concrete value of a {@link PropertyElastic}, e.g., an
 * {@link EventProperty} within an {@link Event}.
 * 
 * @author Waldemar Hummer
 */
public class PropertyValueElastic<T> {

	private PropertyElastic property;

	private T value;

	public PropertyValueElastic() {
	}

	public PropertyValueElastic(T value) {
		this(null, value);
	}

	public PropertyValueElastic(PropertyElastic property, T value) {
		this.property = property;
		this.value = value;
	}

	public PropertyElastic getProperty() {
		return property;
	}

	public void setProperty(PropertyElastic property) {
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
