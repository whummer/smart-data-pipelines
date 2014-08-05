package com.viotualize.core.domain;

import java.util.Collection;

/**
 * Represents a property of an asset.
 *
 * @param <BaseType> The base type of the property, e.g., String or Double
 * 
 * @author Waldemar Hummer
 */
public class Property<BaseType> {

	String name;

	PropertyMetadata metadata;

	Collection<Constraint> constraints;

	ValueDomain<BaseType> valueDomain;

	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public PropertyMetadata getMetadata() {
		return metadata;
	}
	public void setMetadata(PropertyMetadata metadata) {
		this.metadata = metadata;
	}
	public Collection<Constraint> getConstraints() {
		return constraints;
	}
	public ValueDomain<BaseType> getValueDomain() {
		return valueDomain;
	}
	public void setValueDomain(ValueDomain<BaseType> valueDomain) {
		this.valueDomain = valueDomain;
	}
}
