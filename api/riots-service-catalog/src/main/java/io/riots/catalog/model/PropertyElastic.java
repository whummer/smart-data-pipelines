package io.riots.catalog.model;

import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;

import java.util.Collection;

import org.springframework.beans.BeanUtils;

/**
 * Represents a property of an {@link ThingType}.
 * 
 * @author Waldemar Hummer
 * @author riox
 */
public class PropertyElastic extends HierarchicalObjectElastic<PropertyElastic> {

	private Collection<ConstraintElastic> constraints;
	private ValueDomainElastic<?> valueDomain;
	private PropertyTypeElastic propertyType;
	private Boolean sensable;
	private Boolean actuatable;

	public PropertyElastic() {
	}

	public PropertyElastic(String name) {
		super(name);
	}
	
	public PropertyElastic(Property property) {
		BeanUtils.copyProperties(property, this);
		
		// TODO copy constraints
	}

	public Collection<ConstraintElastic> getConstraints() {
		return constraints;
	}

	public ValueDomainElastic<?> getValueDomain() {
		return valueDomain;
	}

	public void setValueDomain(ValueDomainElastic<?> valueDomain) {
		this.valueDomain = valueDomain;
	}

	public PropertyTypeElastic getPropertyType() {
		return propertyType;
	}

	public void setPropertyType(PropertyTypeElastic propertyType) {
		this.propertyType = propertyType;
	}

	public Boolean isSensable() {
		return sensable;
	}

	public PropertyElastic setSensable(Boolean sensable) {
		this.sensable = sensable;
		return this;
	}

	public Boolean isActuatable() {
		return actuatable;
	}

	public PropertyElastic setActuatable(Boolean actuatable) {
		this.actuatable = actuatable;
		return this;
	}

	@Override
	public String toString() {
		return "Property['" + getName() + "']";
	}

}
