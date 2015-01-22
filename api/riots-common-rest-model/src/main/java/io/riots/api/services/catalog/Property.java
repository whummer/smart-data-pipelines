package io.riots.api.services.catalog;

import java.util.Collection;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a property of an asset.
 *
 * @author Waldemar Hummer
 * @author riox
 */
public class Property extends HierarchicalObject<Property> {

	/**
	 * List of constraints of this property.
	 */
	@JsonInclude(Include.NON_EMPTY)
	private Collection<Constraint> constraints;

	/**
	 * Property value domain.
	 */
	@JsonInclude(Include.NON_EMPTY)
	private ValueDomain<?> valueDomain;

	/**
	 * Property base type.
	 */
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("data-type")
	private PropertyType propertyType;

	/**
	 * Whether a property is readable/sensable
	 */
	@JsonInclude(Include.NON_EMPTY)
	private Boolean sensable;

	/**
	 * Whether a property is modifyable/actuatable
	 */
	@JsonInclude(Include.NON_EMPTY)
	private Boolean actuatable;

	/**
	 * Name of the measurement unit of this property, e.g., mm, kg, bar, ...
	 */
	@JsonInclude(Include.NON_EMPTY)
	private String unit;

	public Property() {
	}

	public Property(String name) {
		super(name);
	}
	
	public Property(String name, PropertyType type) {
		this(name);
		this.propertyType = type;
	}

	public Collection<Constraint> getConstraints() {
		return constraints;
	}

	public ValueDomain<?> getValueDomain() {
		return valueDomain;
	}

	public void setUnit(String unit) {
		this.unit = unit;
	}

	public void setValueDomain(ValueDomain<?> valueDomain) {
		this.valueDomain = valueDomain;
	}

	public PropertyType getPropertyType() {
		return propertyType;
	}

	public void setPropertyType(PropertyType propertyType) {
		this.propertyType = propertyType;
	}

	public Boolean isSensable() {
		return sensable;
	}

	public Property setSensable(Boolean sensable) {
		this.sensable = sensable;
		return this;
	}

	public Boolean isActuatable() {
		return actuatable;
	}

	public Property setActuatable(Boolean actuatable) {
		this.actuatable = actuatable;
		return this;
	}

	public Property withActuatable(final Boolean actuatable) {
		this.actuatable = actuatable;
		return this;
	}

	public Property withSensable(final Boolean sensable) {
		this.sensable = sensable;
		return this;
	}

	public Property withPropertyType(final PropertyType propertyType) {
		this.propertyType = propertyType;
		return this;
	}

	public Property withValueDomain(final ValueDomain<?> valueDomain) {
		this.valueDomain = valueDomain;
		return this;
	}

	public Property withConstraints(final Collection<Constraint> constraints) {
		this.constraints = constraints;
		return this;
	}

	@Override
	public String toString() {
		return "Property['" + getName() + "']";
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		Property property = (Property) o;

		if (actuatable != null ? !actuatable.equals(property.actuatable) : property.actuatable != null) return false;
		if (constraints != null ? !constraints.equals(property.constraints) : property.constraints != null)
			return false;
		if (propertyType != property.propertyType) return false;
		if (sensable != null ? !sensable.equals(property.sensable) : property.sensable != null) return false;
		if (unit != null ? !unit.equals(property.unit) : property.unit != null) return false;
		if (valueDomain != null ? !valueDomain.equals(property.valueDomain) : property.valueDomain != null)
			return false;

		return true;
	}

	@Override
	public int hashCode() {
		int result = constraints != null ? constraints.hashCode() : 0;
		result = 31 * result + (valueDomain != null ? valueDomain.hashCode() : 0);
		result = 31 * result + (propertyType != null ? propertyType.hashCode() : 0);
		result = 31 * result + (sensable != null ? sensable.hashCode() : 0);
		result = 31 * result + (actuatable != null ? actuatable.hashCode() : 0);
		result = 31 * result + (unit != null ? unit.hashCode() : 0);
		return result;
	}
}
