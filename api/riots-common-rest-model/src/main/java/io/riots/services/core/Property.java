package io.riots.services.core;

import io.riots.services.core.SemanticType.SemanticPropertyType;

import java.util.Collection;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.JsonToken;

/**
 * Represents a property of an asset.
 *
 * @param <BaseType>
 *            The base type of the property, e.g., String or Double
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({ @Type(value = Property.PropertyString.class, name = "STRING"),
		@Type(value = Property.PropertyLong.class, name = "LONG"),
		@Type(value = Property.PropertyDouble.class, name = "DOUBLE"),
		@Type(value = Property.PropertyBoolean.class, name = "BOOLEAN"),
		@Type(value = Property.PropertyList.class, name = "LIST"),
		@Type(value = Property.PropertyList.class, name = "SET") })
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "data-type")
public class Property<BaseType> extends HierarchicalObject<Property<?>> {

	/**
	 * List of constraints of this property.
	 */
	@JsonInclude(Include.NON_EMPTY)
	private Collection<Constraint> constraints;

	/**
	 * Property value domain.
	 */
	@JsonInclude(Include.NON_EMPTY)
	private ValueDomain<BaseType> valueDomain;

	/**
	 * Property base type.
	 */
	@JsonIgnore // it as added anyway as a discriminator by the class level annotation
	private BaseTypeEnum baseType;

	/**
	 * Semantic type of this property.
	 */
	@JsonProperty("semantic-type")
	@JsonInclude(Include.NON_EMPTY)
	private SemanticPropertyType semanticType;

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

	public enum BaseTypeEnum {
		STRING, LONG, DOUBLE, BOOLEAN, LIST, SET;
	}

	public Property() {
	}

	public Property(String name) {
		super(name);
	}

	public static class PropertyList extends Property<List<?>> {
		{
			setBaseType(BaseTypeEnum.LIST);
		}

		public PropertyList() {
		}

		public PropertyList(String name) {
			super(name);
		}
	}

	public static class PropertyBoolean extends Property<Boolean> {
		{
			setBaseType(BaseTypeEnum.BOOLEAN);
		}

		public PropertyBoolean() {
		}

		public PropertyBoolean(String name) {
			super(name);
		}
	}

	public static class PropertyString extends Property<String> {
		{
			setBaseType(BaseTypeEnum.STRING);
		}

		public PropertyString() {
		}

		public PropertyString(String name) {
			super(name);
		}
	}

	public static class PropertyLong extends Property<Long> {
		{
			setBaseType(BaseTypeEnum.LONG);
		}

		public PropertyLong() {
		}

		public PropertyLong(String name) {
			super(name);
		}
	}

	public static class PropertyDouble extends Property<Double> {
		{
			setBaseType(BaseTypeEnum.DOUBLE);
		}

		public PropertyDouble() {
		}

		public PropertyDouble(String name) {
			super(name);
		}
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

	public BaseTypeEnum getBaseType() {
		return baseType;
	}

	public void setBaseType(BaseTypeEnum baseType) {
		this.baseType = baseType;
	}

	public SemanticPropertyType getSemanticType() {
		return semanticType;
	}

	public void setSemanticType(SemanticPropertyType semanticType) {
		this.semanticType = semanticType;
	}

	public Boolean isSensable() {
		return sensable;
	}

	public Property<?> setSensable(Boolean sensable) {
		this.sensable = sensable;
		return this;
	}

	public Boolean isActuatable() {
		return actuatable;
	}

	public Property<?> setActuatable(Boolean actuatable) {
		this.actuatable = actuatable;
		return this;
	}

	@Override
	public String toString() {
		return "Property['" + getName() + "']";
	}

}
