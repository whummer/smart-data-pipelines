package io.riots.api.services.sim;

import io.riots.api.services.scenarios.TimedValue;

import java.util.LinkedList;
import java.util.List;

/**
 * Represents a sequence of values on a timeline.
 * @author whummer
 * 
 * @param <T> the type of the values appearing on the timeline
 */
public class TimelineValues<T> {

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
