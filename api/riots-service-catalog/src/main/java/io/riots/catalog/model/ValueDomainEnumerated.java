package io.riots.catalog.model;

import java.util.Arrays;
import java.util.Iterator;

import com.fasterxml.jackson.annotation.JsonIgnore;


/**
 * Represents a value domain with enumerated values.
 *
 * @author Waldemar Hummer
 *
 * @param <T> the value base type (e.g., Double)
 */
public class ValueDomainEnumerated<T> extends ValueDomain<T> {
	T[] values;
	public ValueDomainEnumerated() {
		this((T[])null);
	}
	@SafeVarargs
	public ValueDomainEnumerated(T ... values) {
		this.values = values;
		this.type = ValueDomainType.Enumerated;
	}
	@Override
	@JsonIgnore
	public Long getDomainSize() {
		if(values == null)
			return 0L;
		return (long)values.length;
	}
	@Override
	public Iterator<T> iterateValues() {
		return Arrays.asList(values).iterator();
	}
	public T[] getValues() {
		return values;
	}
	public void setValues(T[] values) {
		this.values = values;
	}
}
