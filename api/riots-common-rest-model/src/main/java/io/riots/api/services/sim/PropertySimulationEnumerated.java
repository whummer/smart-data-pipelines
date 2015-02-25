package io.riots.api.services.sim;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.scenarios.TimedValue;

import java.util.ArrayList;
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
	protected List<TimedValue<PropertyValue>> values = new ArrayList<>();

	public List<TimedValue<PropertyValue>> getValues() {
		return values;
	}

	@Override
	public String toString() {
		return getClass().getSimpleName() + "[values=" + values + ", startTime=" + startTime
				+ ", endTime=" + endTime + ", stepInterval=" + stepInterval + "]";
	}

}
