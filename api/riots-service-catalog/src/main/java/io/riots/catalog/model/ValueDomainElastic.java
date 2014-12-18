package io.riots.catalog.model;

import java.util.Iterator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/**
 * Represents the value domain of some value, e.g., a {@link PropertyElastic}.
 * 
 * Iff the domain size is infinite, getDomainSize() returns null.
 * 
 * Iff the domain size is infinite, iterateValues() returns an empty iterator.
 * 
 * @author Waldemar Hummer
 */
public abstract class ValueDomainElastic<BaseType> {

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
