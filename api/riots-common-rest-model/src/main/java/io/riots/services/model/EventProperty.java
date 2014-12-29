package io.riots.services.model;

import io.riots.services.catalog.Property;


/**
 * Represents an event property.
 * 
 * @param <BaseType> The base type of the property, e.g., String or Double
 * 
 * @author Waldemar Hummer
 */
public class EventProperty<BaseType> extends Property {

	private Property representsProperty;

	public Property getRepresentsProperty() {
		return representsProperty;
	}
	public void setRepresentsProperty(Property representsProperty) {
		this.representsProperty = representsProperty;
	}
}
