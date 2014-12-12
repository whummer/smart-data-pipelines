package io.riots.core.model.sim;

import io.riots.core.model.PropertyValue;
import io.riots.core.model.sim.TimelineValues.TimedValue;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Random value simulation.
 * 
 * @author Waldemar Hummer
 */
public class PropertySimulationEnumerated<T> extends PropertySimulation<T> {

	{
		type = PropertySimulation.TYPE_ENUMERATED;
	}

	@JsonProperty
	protected List<TimedValue<PropertyValue<T>>> values = new LinkedList<>();

	@Override
	public TimelineValues<PropertyValue<T>> getValues(Time fromTime,
			Time toTime, Context ctx) {
		return new TimelineValues<PropertyValue<T>>(values);
	}

	@Override
	public PropertyValue<T> getValueAt(Time atTime, Context t) {
		for(TimedValue<PropertyValue<T>> v : values) {
			if(v.time.getTime() == atTime.getTime()) {
				return v.property;
			}
		}
		return null;
	}

	public List<TimedValue<PropertyValue<T>>> getValues() {
		return values;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "[values=" + values + ", property="
				+ property + ", device=" + device + ", startTime=" + startTime
				+ ", endTime=" + endTime + ", stepInterval=" + stepInterval + "]";
	}

}
