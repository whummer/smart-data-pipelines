package io.riots.core.model.sim;

import io.riots.core.model.sim.TimelineValues.TimedValue;
import io.riots.services.scenario.PropertyValue;

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
	protected List<TimedValue<PropertyValue>> values = new LinkedList<>();

	@Override
	public TimelineValues<PropertyValue> getValues(Time fromTime,
			Time toTime, Context ctx) {
		return new TimelineValues<PropertyValue>(values);
	}

	@Override
	public PropertyValue getValueAt(Time atTime, Context t) {
		for(TimedValue<PropertyValue> v : values) {
			if(v.time.getTime() == atTime.getTime()) {
				return v.property;
			}
		}
		return null;
	}

	public List<TimedValue<PropertyValue>> getValues() {
		return values;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "[values=" + values + ", property="
				+ property + ", device=" + thing + ", startTime=" + startTime
				+ ", endTime=" + endTime + ", stepInterval=" + stepInterval + "]";
	}

}
