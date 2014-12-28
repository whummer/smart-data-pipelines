package io.riots.catalog.model;

import java.util.Arrays;
import java.util.Iterator;


/**
 * Represents a value domain with enumerated values.
 *
 * @author Waldemar Hummer
 *
 * @param <T> the value base type (e.g., Double)
 */
public class ValueDomainEnumeratedElastic<T> extends ValueDomainElastic<T> {
	
	T[] values;
	public ValueDomainEnumeratedElastic() {
		this((T[])null);
	}
	@SafeVarargs
	public ValueDomainEnumeratedElastic(T ... values) {
		this.values = values;
		this.type = ValueDomainType.Enumerated;
	}
	
	@Override
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
