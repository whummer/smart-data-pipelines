package com.viotualize.core.domain;

import java.util.Collection;

/**
 * Represents a property of an asset.
 *
 * @param <BaseType> The base type of the property, e.g., String or Double
 * 
 * @author Waldemar Hummer
 */
public abstract class Property<BaseType> {

	String name;

	PropertyMetadata metadata;

	Collection<Constraint> constraints;

	ValueDomain<BaseType> valueDomain;

	BaseTypeEnum baseType;

	public enum BaseTypeEnum {
		STRING, INTEGER, LONG, DOUBLE
	}

	public Property() {}
	public Property(String name) {
		this.name = name;
	}

	public static class PropertyString extends Property<String> {
		public PropertyString() { 
			this(null);
		}
		public PropertyString(String name) {
			super(name);
			baseType = BaseTypeEnum.STRING;
		}
	}
	public static class PropertyLong extends Property<Long> {
		public PropertyLong() { 
			this(null);
		}
		public PropertyLong(String name) {
			super(name);
			baseType = BaseTypeEnum.LONG;
		}
	}
	public static class PropertyInt extends Property<Integer> {
		public PropertyInt()  { 
			this(null);
		}
		public PropertyInt(String name) {
			super(name);
			baseType = BaseTypeEnum.INTEGER;
		}
	}
	public static class PropertyDouble extends Property<Double> {
		public PropertyDouble() {
			this(null);
		}
		public PropertyDouble(String name) {
			super(name);
			baseType = BaseTypeEnum.DOUBLE;
		}
	}

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
	public BaseTypeEnum getBaseType() {
		return baseType;
	}
	public void setBaseType(BaseTypeEnum baseType) {
		this.baseType = baseType;
	}

	@Override
	public String toString() {
		return "Property['" + name + "']";
	}
}
