package io.riots.services.catalog;

import java.util.Collection;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a property of an asset.
 *
 * @param <BaseType>
 *            The base type of the property, e.g., String or Double
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

	@Override
	public String toString() {
		return "Property['" + getName() + "']";
	}

}
