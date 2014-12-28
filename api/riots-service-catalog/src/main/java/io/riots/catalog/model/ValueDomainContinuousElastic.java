package io.riots.catalog.model;

import java.util.Iterator;

/**
 * Represents a value domain with continuous
 * values between a min and a max value.
 *
 * @author Waldemar Hummer
 *
 * @param <T> the value base type (e.g., Double)
 */
public class ValueDomainContinuousElastic<T> extends ValueDomainElastic<T> {
	T min, max;

	public ValueDomainContinuousElastic() {
		this(null, null);
	}
	public ValueDomainContinuousElastic(T min, T max) {
		this.min = min;
		this.max = max;
		this.type = ValueDomainType.Continuous;
	}
	
	@Override
	public Long getDomainSize() {
		return null; // continuous domain can be considered infinite, hence null
	}
	
	@Override
	public Iterator<T> iterateValues() {
		return null;
	}

	public T getMin() {
		return min;
	}
	public void setMin(T min) {
		this.min = min;
	}
	public T getMax() {
		return max;
	}
	public void setMax(T max) {
		this.max = max;
	}
}
