package io.riots.core.services.sim;

import io.riots.core.services.sim.TimelineValues.TimedValue;
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

	public List<TimedValue<PropertyValue>> getValues() {
		return values;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "[values=" + values + ", startTime=" + startTime
				+ ", endTime=" + endTime + ", stepInterval=" + stepInterval + "]";
	}

}
