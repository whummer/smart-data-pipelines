package com.viotualize.core.domain;

/**
 * Represents the concrete value of a {@link Property}, 
 * e.g., an {@link EventProperty} within an {@link Event}.
 * 
 * @author Waldemar Hummer
 */
public class PropertyValue<T> {

	Property<T> property;

	Object value;

	public Property<T> getProperty() {
		return property;
	}
	public void setProperty(EventProperty<T> property) {
		this.property = property;
	}
	public Object getValue() {
		return value;
	}
	public void setValue(Object value) {
		this.value = value;
	}
}
