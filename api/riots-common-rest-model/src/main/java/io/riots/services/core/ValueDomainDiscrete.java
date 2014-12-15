package io.riots.services.core;

import java.util.Iterator;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Represents a value domain with discrete
 * value steps between a min and a max value.
 *
 * @author Waldemar Hummer
 *
 * @param <T> the value base type (e.g., Double)
 */
public class ValueDomainDiscrete<T> extends ValueDomainContinuous<T> {
	T step;
	public ValueDomainDiscrete() {
		this(null, null, null);
	}
	public ValueDomainDiscrete(T min, T max, T step) {
		super(min, max);
		this.step = step;
		this.type = ValueDomainType.Discrete;
	}

	public T getStep() {
		return step;
	}
	public void setStep(T step) {
		this.step = step;
	}

	@Override
	@JsonIgnore
	public Long getDomainSize() {
		double miD = 0;
		double maD = 0;
		double stD = 0;
		if(min instanceof Long) {
			miD = (Long)min; maD = (Long)max; stD = (Long)step;
		} else if(min instanceof Integer) {
			miD = (Integer)min; maD = (Integer)max; stD = (Integer)step;
		} else if(min instanceof Double) {
			miD = (Double)min; maD = (Double)max; stD = (Double)step;
		} else {
			throw new RuntimeException("Invalid domain value: " + min);
		}
		return (long)Math.ceil((maD - miD) / stD);
	}
	@Override
	public Iterator<T> iterateValues() {
		return new Iterator<T>() {
			T current;
			public boolean hasNext() {
				T next = getNext();
				if(next instanceof Long) {
					return (Long)next <= (Long)max;
				} else if(next instanceof Integer) {
					return (Integer)next <= (Integer)max;
				} else if(next instanceof Double) {
					return (Double)next <= (Double)max;
				}
				throw new RuntimeException("Invalid domain value: " + min);
			}
			public T next() {
				if(current == null) {
					return current = min;
				}
				return current = getNext();
			}
			@SuppressWarnings("unchecked")
			private T getNext() {
				T value = current;
				if(value == null) {
					value = min;
				} else if(value instanceof Long) {
					value = (T)(Long)((Long)value + ((Long)step));
				} else if(value instanceof Integer) {
					value = (T)(Integer)((Integer)value + ((Integer)step));
				} else if(value instanceof Double) {
					value = (T)(Double)((Double)value + ((Double)step));
				} else {
					throw new RuntimeException("Invalid domain value: " + value);
				}
				return value;
			}
		};
	}
}
