package io.riots.services.sim;

import java.util.LinkedList;
import java.util.List;

/**
 * Represents a sequence of values on a timeline.
 * @author whummer
 * 
 * @param <T> the type of the values appearing on the timeline
 */
public class TimelineValues<T> {

	public static class TimedValue<T> {
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

	protected List<TimedValue<T>> values = new LinkedList<>();

	public TimelineValues() {}
	public TimelineValues(List<TimedValue<T>> values) {
		this.values = values;
	}
	public List<TimedValue<T>> getValues() {
		return values;
	}
	public void setValues(List<TimedValue<T>> values) {
		this.values = values;
	}
}
