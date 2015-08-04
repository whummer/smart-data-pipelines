package io.riots.api.services.scenarios;

import io.riots.api.services.sim.Time;

/**
 * Value of a property at a given point in time.
 * @author whummer
 * @param <T>
 */
public class TimedValue<T> {
	public Time time;
	public T property;
	public TimedValue() {}
	public TimedValue(Time time, T property) {
		this.time = time;
		this.property = property;
	}
	@Override
	public String toString() {
		return "TPV[" + time + "," + property + "]";
	}
}
