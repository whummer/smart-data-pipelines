package io.riots.api.services.catalog;

import java.util.Iterator;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Represents a value domain with continuous
 * values between a min and a max value.
 *
 * @author Waldemar Hummer
 *
 * @param <T> the value base type (e.g., Double)
 */
public class ValueDomainContinuous<T> extends ValueDomain<T> {
	T min, max;

	public ValueDomainContinuous() {
		this(null, null);
	}
	public ValueDomainContinuous(T min, T max) {
		this.min = min;
		this.max = max;
		this.type = ValueDomainType.Continuous;
	}
	@JsonIgnore
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

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		ValueDomainContinuous that = (ValueDomainContinuous) o;

		if (max != null ? !max.equals(that.max) : that.max != null) return false;
		if (min != null ? !min.equals(that.min) : that.min != null) return false;

		return true;
	}

	@Override
	public int hashCode() {
		int result = min != null ? min.hashCode() : 0;
		result = 31 * result + (max != null ? max.hashCode() : 0);
		return result;
	}
}
