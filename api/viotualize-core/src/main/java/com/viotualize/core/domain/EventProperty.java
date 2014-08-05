package com.viotualize.core.domain;


/**
 * Represents an event property.
 * 
 * @param <BaseType> The base type of the property, e.g., String or Double
 * 
 * @author Waldemar Hummer
 */
public class EventProperty<BaseType> extends Property<BaseType> {

	private Property<BaseType> representsProperty;

	public Property<BaseType> getRepresentsProperty() {
		return representsProperty;
	}
	public void setRepresentsProperty(Property<BaseType> representsProperty) {
		this.representsProperty = representsProperty;
	}
}
