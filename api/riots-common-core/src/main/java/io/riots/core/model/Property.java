package io.riots.core.model;

import io.riots.core.model.SemanticType.SemanticPropertyType;

import java.util.Collection;
import java.util.List;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents a property of an asset.
 *
 * @param <BaseType>
 *            The base type of the property, e.g., String or Double
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({
	@Type(value = Property.PropertyString.class, name="STRING"),
	@Type(value = Property.PropertyLong.class, name="LONG"),
	@Type(value = Property.PropertyDouble.class, name="DOUBLE"),
	@Type(value = Property.PropertyBoolean.class, name="BOOLEAN"),
	@Type(value = Property.PropertyList.class, name="LIST"),
	@Type(value = Property.PropertyList.class, name="SET")
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "baseType"
)
@Document(collection = Constants.COLL_PROPERTIES)
public class Property<BaseType> extends HierarchicalObject<Property<?>> {

	/**
	 * Property metadata.
	 */
	PropertyMetadata metadata = new PropertyMetadata();
	/**
	 * List of constraints of this property.
	 */
	Collection<Constraint> constraints;
	/**
	 * Property value domain.
	 */
	ValueDomain<BaseType> valueDomain;
	/**
	 * Property base type.
	 */
	BaseTypeEnum baseType;
	/**
	 * Semantic type of this property.
	 */
	@DBRef
	SemanticPropertyType semanticType;

	public enum BaseTypeEnum {
		STRING, LONG, DOUBLE, BOOLEAN, LIST, SET;
	}

	public Property() {}
	public Property(String name) {
		this.name = name;
	}

	public static class PropertyList extends Property<List<?>> {
		{
			baseType = BaseTypeEnum.LIST;
		}
		public PropertyList() {}
		public PropertyList(String name) {
			super(name);
		}
	}

	public static class PropertyBoolean extends Property<Boolean> {
		{
			baseType = BaseTypeEnum.BOOLEAN;
		}
		public PropertyBoolean() {}
		public PropertyBoolean(String name) {
			super(name);
		}
	}

	public static class PropertyString extends Property<String> {
		{
			baseType = BaseTypeEnum.STRING;
		}
		public PropertyString() {}
		public PropertyString(String name) {
			super(name);
		}
	}

	public static class PropertyLong extends Property<Long> {
		{
			baseType = BaseTypeEnum.LONG;
		}
		public PropertyLong() {}
		public PropertyLong(String name) {
			super(name);
		}
	}

	public static class PropertyDouble extends Property<Double> {
		{
			baseType = BaseTypeEnum.DOUBLE;
		}
		public PropertyDouble() {}
		public PropertyDouble(String name) {
			super(name);
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
	public SemanticPropertyType getSemanticType() {
		return semanticType;
	}
	public void setSemanticType(SemanticPropertyType semanticType) {
		this.semanticType = semanticType;
	}

	@Override
	public String toString() {
		return "Property['" + name + "']";
	}

}
