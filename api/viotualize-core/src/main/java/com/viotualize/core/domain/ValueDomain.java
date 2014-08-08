package com.viotualize.core.domain;

import java.util.Arrays;
import java.util.Iterator;

/**
 * Represents the value domain of some value, e.g., a {@link Property}.
 * 
 * Iff the domain size is infinite, getDomainSize() returns null.
 * 
 * Iff the domain size is infinite, iterateValues() returns an empty iterator.
 * 
 * @author Waldemar Hummer
 */
public abstract class ValueDomain<BaseType> {

	public abstract Long getDomainSize();

	public abstract Iterator<BaseType> iterateValues();

	/**
	 * Represents a value domain with continuous
	 * values between a min and a max value.
	 *
	 * @author Waldemar Hummer
	 *
	 * @param <T> the value base type (e.g., Double)
	 */
	public static class ContinuousVD<T> extends ValueDomain<T> {
		T min, max;

		public ContinuousVD() {}
		public ContinuousVD(T min, T max) {
			this.min = min;
			this.max = max;
		}
		public Long getDomainSize() {
			return null; // continuous domain can be considered infinite, hence null
		}
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

	/**
	 * Represents a value domain with discrete
	 * value steps between a min and a max value.
	 *
	 * @author Waldemar Hummer
	 *
	 * @param <T> the value base type (e.g., Double)
	 */
	public static class DiscreteVD<T> extends ContinuousVD<T> {
		T step;
		public DiscreteVD() { }
		public DiscreteVD(T min, T max, T step) {
			super(min, max);
			this.step = step;
		}
		@Override
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

	/**
	 * Represents a value domain with enumerated values.
	 *
	 * @author Waldemar Hummer
	 *
	 * @param <T> the value base type (e.g., Double)
	 */
	public static class EnumerationVD<T> extends ValueDomain<T> {
		T[] values;
		public EnumerationVD() { }
		@SafeVarargs
		public EnumerationVD(T ... values) {
			this.values = values;
		}
		@Override
		public Long getDomainSize() {
			return (long)values.length;
		}
		@Override
		public Iterator<T> iterateValues() {
			return Arrays.asList(values).iterator();
		}
		public T[] getValues() {
			return values;
		}
	}

	
}
