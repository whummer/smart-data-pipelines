package io.riots.services.catalog;

import java.util.Iterator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents the value domain of some value, e.g., a {@link Property}.
 * 
 * Iff the domain size is infinite, getDomainSize() returns null.
 * 
 * Iff the domain size is infinite, iterateValues() returns an empty iterator.
 * 
 * @author Waldemar Hummer
 */
@JsonSubTypes({
	@Type(value = ValueDomainDiscrete.class, name="Discrete"),
	@Type(value = ValueDomainContinuous.class, name="Continuous"),
	@Type(value = ValueDomainEnumerated.class, name="Enumerated")
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "type"
)
public abstract class ValueDomain<BaseType> {

	ValueDomainType type;

	public static enum ValueDomainType {
		Discrete, Continuous, Enumerated
	}

	/**
	 * Get the number of possible values in this value domain. Has to
	 * be equal to the number of values returned by the iterator from
	 * iterateValues().
	 * @return
	 */
	@JsonIgnore
	public abstract Long getDomainSize();

	/**
	 * Iterate over all possible values in this value domain.
	 * @return
	 */
	public abstract Iterator<BaseType> iterateValues();

	public ValueDomainType getType() {
		return type;
	}
	public void setType(ValueDomainType type) {
		this.type = type;
	}
	
	
}
